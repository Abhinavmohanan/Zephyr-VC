interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  offer: (payload: OfferType) => void;
  answer: (answer: OfferType) => void;
  candidate: (candidate: ICEType) => void;
  "user-joined": (payload: { socketId: string }) => void;
  "user-left": (payload: { socketId: string }) => void;
}

type OfferType = {
  target: string;
  caller: string;
  sdp: RTCSessionDescriptionInit;
};

type ICEType = {
  target: string;
  candidate: RTCIceCandidateInit;
};

interface ClientToServerEvents {
  hello: () => void;
  //ice candidate
  candidate: (candidate: ICEType) => void;
  //offer
  offer: (payload: OfferType) => void;
  //answer
  answer: (answer: OfferType) => void;
  "user-joined": (payload: { socketId: string; target: string }) => void;
  "join-room": (
    roomId: string,
    userId: string,
    callback: (data: {
      status: string;
      message: string;
      secondarySocketId: string | null;
    }) => void
  ) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  roomId: string;
}

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
