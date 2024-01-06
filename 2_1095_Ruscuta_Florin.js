const canvas = document.getElementById("my-canvas");
const context = canvas.getContext("2d");
const playlistContainer = document.querySelector("#playlist ul");
let playlistItems = document.querySelectorAll("#playlist ul li");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
let currentVideoIndex = 0;
const increaseRed = document.getElementById("increase-red-button");
const decreaseRed = document.getElementById("decrease-red-button");
const increaseGreen = document.getElementById("increase-green-button");
const decreaseGreen = document.getElementById("decrease-green-button");
const increaseBlue = document.getElementById("increase-blue-button");
const decreaseBlue = document.getElementById("decrease-blue-button");
const resetColors = document.getElementById("reset-rgb-button");

let redValue = 0;
let greenValue = 0;
let blueValue = 0;

increaseRed.addEventListener("click", () => {
  redValue = Math.min(redValue + 10, 255);
  applyColorAdjustment();
});

decreaseRed.addEventListener("click", () => {
  redValue = Math.max(redValue - 10, 0);
  applyColorAdjustment();
});

increaseGreen.addEventListener("click", () => {
  greenValue = Math.min(greenValue + 10, 255);
  applyColorAdjustment();
});

decreaseGreen.addEventListener("click", () => {
  greenValue = Math.max(greenValue - 10, 0);
  applyColorAdjustment();
});

increaseBlue.addEventListener("click", () => {
  blueValue = Math.min(blueValue + 10, 255);
  applyColorAdjustment();
});

decreaseBlue.addEventListener("click", () => {
  blueValue = Math.max(blueValue - 10, 0);
  applyColorAdjustment();
});

resetColors.addEventListener("click", () => {
  redValue = 0;
  greenValue = 0;
  blueValue = 0;
  applyColorAdjustment();
});

function applyColorAdjustment() {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] += redValue;
    pixels[i + 1] += greenValue;
    pixels[i + 2] += blueValue;
  }

  context.putImageData(imageData, 0, 0);
}

const instructionsButton = document.getElementById("instructions-button");
const instructionsModal = document.getElementById("instructionsModal");

instructionsButton.addEventListener("click", () => {
  instructionsModal.style.display = "block";
});

function closeModal() {
  instructionsModal.style.display = "none";
}

const dynamicVideo = document.createElement("video");
dynamicVideo.style.display = "none";
document.body.appendChild(dynamicVideo);

canvas.width = 800;
canvas.height = 520;

dynamicVideo.addEventListener("loadedmetadata", () => {
  canvas.width = 800;
  canvas.height = 520;
});

dynamicVideo.addEventListener("timeupdate", () => {
  drawVideo();
  drawControls();
});

dynamicVideo.addEventListener("ended", () => {
  currentVideoIndex = (currentVideoIndex + 1) % playlistItems.length;
  loadVideo(currentVideoIndex);
});

prevButton.addEventListener("click", () => toggleVideoAction("prev"));
nextButton.addEventListener("click", () => toggleVideoAction("next"));

canvas.addEventListener("mouseup", handleCanvasClick);

const fileInput = document.getElementById("movie-input");
fileInput.addEventListener("change", handleFileInputChange);

instructionsButton.addEventListener("click", () => instructionsModal.show());

playlistItems.forEach((item) => {
  const deleteButton = createDeleteButton();
  item.appendChild(deleteButton);
  addPlaylistItemEventListeners(item);
});

loadVideo(currentVideoIndex);

function drawVideo() {
  context.drawImage(dynamicVideo, 0, 0, canvas.width, canvas.height);
  applyColorAdjustment();
  // drawControls(); // Assuming drawControls function contains the progress bar drawing
}

function drawControls() {
  const controlsConfig = [
    { x: 10, y: 20, width: 30, height: 30, label: "⏮️" },
    { x: canvas.width - 70, y: 20, width: 30, height: 30, label: "⏭️" },
    {
      x: 10,
      y: canvas.height - 60,
      width: 70,
      height: 30,
      label: "⏯️",
    },
    {
      x: 10,
      y: canvas.height - 15,
      width: canvas.width - 20,
      height: 10,
      label: "",
    },
    {
      x: canvas.width - 60,
      y: canvas.height - 65,
      width: 50,
      height: 30,
      label: "🔇",
    },
  ];

  context.fillStyle = "rgba(255, 255, 255, 0.5)";
  context.fillStyle = "white";
  context.font = "24px Arial";

  controlsConfig.forEach((control) => {
    context.fillText(control.label, control.x + 10, control.y + 25);
  });

  const progress = dynamicVideo.currentTime / dynamicVideo.duration;
  context.fillStyle = "blue";
  context.fillRect(10, canvas.height - 15, (canvas.width - 20) * progress, 10);
}

function loadVideo(index) {
  currentVideoIndex = index;
  const videoSource = playlistItems[index].getAttribute("data-video");
  dynamicVideo.src = videoSource;
  dynamicVideo.load();
  canvas.style.display = "none";

  increaseBlue.style.display = "none";
  increaseGreen.style.display = "none";
  increaseRed.style.display = "none";
  decreaseBlue.style.display = "none";
  decreaseRed.style.display = "none";
  decreaseGreen.style.display = "none";
  resetColors.style.display = "none";

  document.addEventListener("click", () => {
    dynamicVideo
      .play()
      .then(() => {
        canvas.style.display = "block";
        increaseBlue.style.display = "block";
        increaseGreen.style.display = "block";
        increaseRed.style.display = "block";
        decreaseBlue.style.display = "block";
        decreaseRed.style.display = "block";
        decreaseGreen.style.display = "block";
        resetColors.style.display = "block";
      })
      .catch((error) =>
        console.error("Failed to play the video:", error.message)
      );
  });

  dynamicVideo.addEventListener("ended", () => {
    currentVideoIndex = (currentVideoIndex + 1) % playlistItems.length;
    loadVideo(currentVideoIndex - 1);
    setTimeout(() => dynamicVideo.click(), 1000);
  });
}

function handleFileInputChange(event) {
  const newVideoFile = event.target.files[0];
  const newVideoSource = URL.createObjectURL(newVideoFile);
  addNewPlaylistItem(newVideoSource);
}

function addNewPlaylistItem(videoSource) {
  const newPlaylistItem = document.createElement("li");
  newPlaylistItem.classList = "list-group-item";
  newPlaylistItem.setAttribute("data-video", videoSource);

  const deleteButton = createDeleteButton();
  const videoPreview = createVideoPreview(videoSource);

  newPlaylistItem.appendChild(videoPreview);
  newPlaylistItem.appendChild(deleteButton);

  playlistContainer.appendChild(newPlaylistItem);
  addPlaylistItemEventListeners(newPlaylistItem);
  updatePlaylistItems();
}

function createDeleteButton() {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "btn btn-danger delete-button";
  return deleteButton;
}

function createVideoPreview(videoSource) {
  const videoPreview = document.createElement("video");
  videoPreview.src = videoSource;
  videoPreview.width = 150;
  videoPreview.controls = false;
  videoPreview.preload = "metadata";
  return videoPreview;
}
// todo: asta e de 2 ori si aici si la linia 268
function addPlaylistItemEventListeners(item) {
  const deleteButton = item.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    if (playlistContainer.contains(item)) {
      playlistContainer.removeChild(item);
      updatePlaylistItems();
    }
  });

  item.addEventListener("click", () => {
    const index = Array.from(playlistContainer.children).indexOf(item);
    loadVideo(index);
  });
}

function updatePlaylistItems() {
  playlistItems = document.querySelectorAll("#playlist ul li");
  playlistItems.forEach((item) => {
    const deleteButton = item.querySelector(".delete-button");
    if (!deleteButton) {
      const newDeleteButton = createDeleteButton();
      item.appendChild(newDeleteButton);
    }
  });

  playlistItems.forEach((item, index) => {
    const deleteButton = item.querySelector(".delete-button");
    item.addEventListener("click", () => loadVideo(index));

    deleteButton.addEventListener("click", () => {
      playlistContainer.removeChild(item);
      updatePlaylistItems();
    });
  });
}

function toggleVideoAction(action) {
  if (action === "prev") {
    currentVideoIndex =
      (currentVideoIndex - 1 + playlistItems.length) % playlistItems.length;
    loadVideo(currentVideoIndex);
  } else if (action === "next") {
    currentVideoIndex = (currentVideoIndex + 1) % playlistItems.length;
    loadVideo(currentVideoIndex);
  }
}

function handleCanvasClick(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  if (
    mouseX > 25 &&
    mouseX < 50 &&
    mouseY > canvas.height - 60 &&
    mouseY < canvas.height - 30
  ) {
    togglePlayPause();
  } else if (mouseX > 10 && mouseX < 80 && mouseY > 10 && mouseY < 40) {
    toggleVideoAction("prev");
  } else if (
    mouseX > canvas.width - 80 &&
    mouseX < canvas.width - 10 &&
    mouseY > 10 &&
    mouseY < 40
  ) {
    toggleVideoAction("next");
  } else if (
    mouseX > canvas.width - 60 &&
    mouseX < canvas.width - 10 &&
    mouseY > canvas.height - 75 &&
    mouseY < canvas.height - 45
  ) {
    toggleMute();
  }
}

function togglePlayPause() {
  dynamicVideo.paused ? dynamicVideo.play() : dynamicVideo.pause();
  console.log("toggleplaypause");
}

function toggleMute() {
  dynamicVideo.muted = !dynamicVideo.muted;
  console.log("toggleMute");
}
