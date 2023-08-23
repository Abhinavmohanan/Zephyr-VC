import { useState } from 'react'
import ReactPlayer from 'react-player'
import { BsMic, BsMicMute, BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
// import { useParams } from 'react-router-dom'

function Meet() {
  const [myStream, setMyStream] = useState<MediaStream>()
  const [myPlaying, setMyPlaying] = useState<boolean>(false);
  // const [otherPlaying, setOtherPlaying] = useState<boolean>(false);
  const [secondStream,] = useState<MediaStream>()
  const [mute, setMuted] = useState<boolean>(true);
  // const { id } = useParams();

  const stopStream = async (stream: MediaStream) => {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  };

  const getMyStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setMyStream(stream)
    }
    catch (error) {
      console.error("Error getting webcam");
    }

  }

  const handleToggleMute = () => {
    myStream?.getAudioTracks().forEach(track => {
      track.enabled = !mute;
    });
    setMuted(!mute);
  };

  const handleToggleVideo = () => {
    if (myPlaying) {
      stopStream(myStream!);
      setMyStream(undefined)
    }
    else {
      getMyStream()
    }
    setMyPlaying(!myPlaying)
  }

  return (
    // <ReactPlayer url={myStream} playing={true} muted={true} height='100%' width='100%' />
    <div className='h-screen flex flex-col justify-around'>
      <div className='flex justify-center items-start gap-5'>
        <div className='flex justify-center items-center bg-neutral w-[46rem] h-[40rem] rounded-3xl shadow-xl text-info'>
          {myPlaying ? <ReactPlayer style={{ transform: 'scaleX(-1)' }} url={myStream} playing={true} muted={true} height='100%' width='100%' /> :
            `Video Disabled`}
        </div>
        <div className='flex justify-center items-center bg-neutral w-[46rem] h-[40rem] rounded-3xl shadow-xl text-info'>
          <ReactPlayer style={{ transform: 'scaleX(-1)' }} url={secondStream} playing={false} muted={true} height='100%' width='100%' />
        </div>
      </div>
      <div className='flex justify-center items-center self-center gap-5 bg-neutral w-[30rem] h-[5rem] rounded-3xl shadow-xl text-info'>
        <div className='border-solid border-2 rounded-full p-2' onClick={handleToggleVideo}>{myPlaying ? <BsCameraVideo size={30} /> : <BsCameraVideoOff size={30} />}</div>
        <div className='border-solid border-2 rounded-full p-2' onClick={handleToggleMute}>{mute ? <BsMicMute size={30} /> : <BsMic size={30} />}</div>
      </div>
    </div>
  )
}

export default Meet
