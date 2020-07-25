const socket = io("/");
const peer = new Peer(undefined, {
  secure: true,
  host: "spanion-video-chat-peer.herokuapp.com",
});

const peers = {};
const videoGrid = document.getElementById("video-grid");

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const video = document.createElement("video");
video.muted = true;

const mediaConfig = {
  video: true,
  audio: true,
};
navigator.mediaDevices
  .getUserMedia(mediaConfig)
  .then((stream) => {
    addVideoStream(video, stream);

    peer.on("call", (call) => {
      call.answer(stream);

      const video = document.createElement("video");
      call.on("stream", (userStream) => {
        addVideoStream(video, userStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => {
    document.write(err);
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userStream) => {
    addVideoStream(video, userStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
