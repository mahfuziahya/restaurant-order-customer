import type { Server } from "socket.io";

let io: Server | null = null;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
