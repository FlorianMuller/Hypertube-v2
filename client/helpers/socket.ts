import socketIOClient from "socket.io-client";

const socket = socketIOClient(window.location.origin);
const sock = socket.on("connect", (io: void) => {
  return io;
});
export default sock;
