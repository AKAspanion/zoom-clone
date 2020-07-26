const myName = prompt("Please enter your name");

const socket = io("/");
const peer = new Peer(undefined, {
  secure: true,
  host: "spanion-video-chat-peer.herokuapp.com",
  // host: "/",
  // port: "3001",
});

const peers = {};
const videoGrid = document.getElementById("video-grid");

const video = document.createElement("video");
video.muted = true;

const mediaConfig = {
  video: true,
  audio: true,
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, { id, name: myName });
  navigator.mediaDevices
    .getUserMedia(mediaConfig)
    .then((stream) => {
      addVideoStream(video, stream, id);

      peer.on("call", (call) => {
        call.answer(stream);

        const video = document.createElement("video");
        call.on("stream", (userStream) => {
          addVideoStream(video, userStream, call.peer);
        });
      });

      socket.on("user-connected", (userData) => {
        connectToNewUser(userData, stream);
      });
    })
    .catch((err) => {
      document.write(err);
    });
});

socket.on("user-disconnected", ({ id }) => {
  const video = document.getElementById(id);
  if (video) video.remove();

  if (peers[id]) peers[id].close();
});

function connectToNewUser({ id }, stream) {
  const call = peer.call(id, stream, { metadata: { name: myName } });

  const video = document.createElement("video");
  call.on("stream", (userStream) => {
    addVideoStream(video, userStream, id);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[id] = call;
}

function addVideoStream(video, stream, id) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.setAttribute("id", id);
  videoGrid.append(video);
}
