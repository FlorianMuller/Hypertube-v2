import socketIOClient from "socket.io-client";

const socket = socketIOClient(window.location.origin);
const sock = socket.on("connect", (io: any) => {
  return io;
});
export default sock;
