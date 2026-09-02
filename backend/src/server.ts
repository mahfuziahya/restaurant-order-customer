import dotenv from "dotenv";

dotenv.config();
import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { setSocketIO } from "./config/socket";

const PORT = 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

setSocketIO(io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-order", (orderId: number) => {
    const room = `order-${orderId}`;

    socket.join(room);

    console.log(`📦 ${socket.id} joined ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
