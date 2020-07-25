const socket = io("/");

socket.emit("join-room", ROOM_ID, 10);

socket.on("user-connected", (id) => {
  console.log(id);
});
