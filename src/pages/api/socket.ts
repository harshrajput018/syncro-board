import { Server } from "socket.io";

export default function handler(req: any, res: any) {
  if (res.socket.server.io) {
    return res.end();
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on("board-update", (data) => {
      socket.broadcast.emit("update-client", data);
    });
  });

  res.end();
}
