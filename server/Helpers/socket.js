import socketIo from "socket.io";

const Io = {};

Io.init = async (server) => {
  Io.socket = socketIo(server);
  Io.socket.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-movie-room", (movieId) => {
      console.log("Joined movie room");
      socket.join(movieId);
    });

    socket.on("leave-movie-room", (movieId) => {
      console.log("Left movie room");
      socket.leave(movieId);
    });
  });
};

export default Io;
