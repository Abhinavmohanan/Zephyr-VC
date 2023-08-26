import React, { useContext, createContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/types";


export const SocketContext = createContext<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);


export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_PUBLIC_API_KEY}`, { autoConnect: false });
    setSocket(newSocket)

    return () => {
      newSocket.disconnect();
      newSocket.removeAllListeners();
    }
  }, [])


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
