import io from "socket.io-client";

// const URL = "https://test-socket-21.herokuapp.com/";
const URL = "http://localhost:5000/";

const sockets = io(URL, {
  autoConnect: true,
  forceNew: true,
});

export default sockets;
