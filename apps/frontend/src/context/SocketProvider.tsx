import React, { useContext, createContext } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "types/types";


export const SocketContext = createContext<SocketContextProps | null>(null);

export interface SocketContextProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export const useSocket = () => {
  const socketContext = useContext(SocketContext);
  if (!socketContext) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socketContext.socket;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = io(`${import.meta.env.VITE_PUBLIC_API_KEY}`);
  const socketContext = { socket };

  return (
    <SocketContext.Provider value={socketContext}>
      {children}
    </SocketContext.Provider>
  );
};
