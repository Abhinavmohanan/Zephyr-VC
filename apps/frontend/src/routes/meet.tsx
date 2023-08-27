import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { BsMic, BsMicMute, BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { useSocket } from '../context/SocketProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
// import { useParams } from 'react-router-dom'

function Meet() {
  const [myStream, setMyStream] = useState<MediaStream>()
  const [myPlaying, setMyPlaying] = useState<boolean>(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [otherPlaying, setOtherPlaying] = useState<boolean>(false);
  const [secondStream, setSecondaryStream] = useState<MediaStream>()
  const [mute, setMuted] = useState<boolean>(true);

  //Get room id from params
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket();
  const [secondarySocket, setSecondarySocket] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const negotiation = (socket: Socket) => {
      console.log("Negotiation Needed");
      peerRef.current?.createOffer().then((offer) => {
        peerRef.current?.setLocalDescription(offer).then(() => {
          console.log("Sending Offer")
          const payload = {
            target: secondarySocket,
            caller: socket.id,
            sdp: offer
          }
          socket.emit("offer", payload);
        })
      }).catch((e) => console.log(e));
    }
    if (socket) {
      if (socket.disconnected) socket.connect();
      socket.on("user-left", () => {
        console.log("User left");
        setSecondarySocket(null);
        setOtherPlaying(false);
        setSecondaryStream(undefined);
      })

      socket.on("user-joined", (payload) => {
        setSecondarySocket(payload.socketId);
        stopStream();
        if (myPlaying) {
          getMyStream();
        }
        else {
          if (!mute) getAudioStream();
        }
        console.log("User joined " + payload.socketId);
      })

      if (!peerRef.current) {
        peerRef.current = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.stunprotocol.org",
            },
            {
              urls: "stun:stun.l.google.com:19302",
            }
          ]
        });
      }

      // peerRef.current.onconnectionstatechange = () => {
      //   if (peerRef.current?.connectionState === 'disconnected') {
      //     console.log("Disconnected");
      //     setSecondarySocket(null);
      //     setOtherPlaying(false);
      //     setSecondaryStream(undefined);
      //   }
      // }

      peerRef.current.ontrack = (event) => {
        const stream = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          stream.addTrack(track);
        })

        //When tracks stopped
        event.streams[0].onremovetrack = () => {
          setOtherPlaying(false);
          setSecondaryStream(undefined);
        }

        setSecondaryStream(stream);
        setOtherPlaying(true);
      }

      if (secondarySocket) {
        peerRef.current.onnegotiationneeded = () => {
          negotiation(socket)
        }

        peerRef.current.onicecandidate = (e) => {
          console.log("Ice candidates generated");
          if (e.candidate) {
            const payload = {
              candidate: e.candidate,
              target: secondarySocket,
            }
            socket.emit("candidate", payload);
          }
        }

        socket.on("candidate", (payload) => {
          peerRef.current?.addIceCandidate(payload.candidate).catch((e) => console.log(e));
        })

        socket.on("offer", (payload) => {
          console.log("Offer recieved")
          peerRef.current?.setRemoteDescription(payload.sdp).then(() => {
            peerRef.current?.createAnswer().then((answer) => {
              peerRef.current?.setLocalDescription(answer).then(() => {
                console.log("Sending Answer")
                const payload = {
                  target: secondarySocket,
                  caller: socket.id,
                  sdp: answer
                }
                socket.emit("answer", payload);
              })
            })
          }).catch((e) => console.log(e));
        })

        socket.on("answer", (payload) => {
          console.log("Answer recieved")
          peerRef.current?.setRemoteDescription(payload.sdp).catch((e) => console.log(e));
        })
      }
    }

    return () => {
      //Remove track event
      peerRef.current?.close();
      peerRef.current = null;
      socket?.removeAllListeners();
    }
  }, [socket, secondarySocket])

  useEffect(() => {
    //Prevent undefined roomId
    if (roomId === undefined) {
      navigate("/");
      return
    }
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to server" + socket.id);
        socket.emit("join-room", roomId, socket.id, (data) => {
          console.log(data.message);
          setSecondarySocket(data.secondarySocketId);
        })
      });
    }
  }, [navigate, roomId, socket])

  useEffect(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => {
        peerRef.current?.addTrack(track, myStream!);
      });
    }
    else {
      peerRef.current?.getSenders().forEach(sender => {
        peerRef.current?.removeTrack(sender);
      })
    }

    return () => {
      //Stop stream
      myStream?.getTracks().forEach(track => {
        track.stop();
      })
    }
  }, [myStream])

  const getMyStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (mute) {
        stream?.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      setMyStream(stream)
    }
    catch (error) {
      console.error("Error getting webcam");
    }
  }

  const getAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      setMyStream(stream)
    }
    catch (error) {
      console.error("Error getting Microphone");
    }
  }

  const handleToggleMute = () => {
    if (mute && !myPlaying) {
      stopStream();
      getAudioStream();
    }
    myStream?.getAudioTracks().forEach(track => {
      track.enabled = mute;
    });
    setMuted(!mute);
  };

  const stopStream = () => {
    myStream?.getTracks().forEach(track => {
      track.stop();
    })
    setMyStream(undefined)
  }

  const handleToggleVideo = () => {
    if (myPlaying) {
      //Stop all track
      stopStream();
      if (!mute) {
        getAudioStream();
      }
    }
    else {
      stopStream();
      getMyStream()
    }
    setMyPlaying(!myPlaying)
  }

  return (
    // <ReactPlayer url={myStream} playing={true} muted={true} height='100%' width='100%' />
    <div className='h-screen flex flex-col justify-center gap-5'>
      <div className='flex justify-center items-start px-5 gap-5 relative'>
        <div className='flex justify-center items-center bg-neutral w-full h-[34rem] rounded-3xl shadow-xl text-info  max-lg:absolute max-lg:w-36 max-lg:h-36 bottom-2 right-8 max-lg:z-10'>
          {myPlaying ? <ReactPlayer style={{ transform: 'scaleX(-1)' }} url={myStream} playing={true} muted={true} height='95%' width='100%' /> :
            `Video Disabled`}
        </div>
        <div className='flex justify-center items-center bg-neutral w-full h-[34rem] rounded-3xl shadow-xl text-info '>
          {!secondarySocket ? `Share Meet ID: ${roomId}` :
            otherPlaying ? <ReactPlayer style={{ transform: 'scaleX(-1)' }} url={secondStream} playing={true} muted={false} height='95%' width='100%' /> : `Video Disabled`}
        </div>
      </div>
      <div className='flex justify-center items-center self-center gap-5 bg-neutral w-[30rem] h-[5rem] rounded-3xl shadow-xl text-info max-lg:w-full'>
        <div className='border-solid border-2 rounded-full p-2' onClick={handleToggleVideo}>{myPlaying ? <BsCameraVideo size={30} /> : <BsCameraVideoOff size={30} />}</div>
        <div className='border-solid border-2 rounded-full p-2' onClick={handleToggleMute}>{mute ? <BsMicMute size={30} /> : <BsMic size={30} />}</div>
      </div>
    </div>
  )
}

export default Meet
