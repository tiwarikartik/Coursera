const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const timelineContainer = document.querySelector(".timeline-container");

let wasPaused;
let isScrubbing = false;

playPauseBtn.addEventListener("click", togglePlay);

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
    videoContainer.classList.add("paused");
});

fullScreenBtn.addEventListener("click", toggleFullScreenMode);
document.addEventListener("fullscreenchange", () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
});

video.addEventListener("volumechange", () => {
    volumeSlider.value = video.volume;
    let volumeLevel;
    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0;
        volumeLevel = "mute";
    } else if (video.volume >= 0.5) {
        volumeLevel = "high";
    } else {
        volumeLevel = "low";
    }
    videoContainer.dataset.volumeLevel = volumeLevel;
});

video.addEventListener("loadeddata", () => {
    totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
    currentTimeElem.textContent = formatDuration(video.currentTime);
    const percent = video.currentTime / video.duration;
    timelineContainer.style.setProperty("--progress-position", percent);
});

// Timeline

timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
video.addEventListener("mouseup", (e) => {
    if (isScrubbing) toggleScrubbing(e);
});
video.addEventListener("mousemove", (e) => {
    if (isScrubbing) handleTimelineUpdate(e);
});

function toggleScrubbing(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

    isScrubbing = (e.buttons & 1) === 1;
    videoContainer.classList.toggle("scrubbing", isScrubbing);
    if (isScrubbing) {
        wasPaused = video.paused;
        video.pause();
    } else {
        video.currentTime = percent * video.duration;
        if (!wasPaused) {
            video.play();
        }
    }

    handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
    const rect = timelineContainer.getBoundingClientRect();
    const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
    timelineContainer.style.setProperty("--preview-position", percent);

    if (isScrubbing) {
        timelineContainer.style.setProperty("--progress-position", percent);
    }
}

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});

function formatDuration(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
        return `${hours}:${minutes}:${leadingZeroFormatter.format(seconds)}`;
    }
}

function togglePlay() {
    video.paused ? video.play() : video.pause();
}

function toggleFullScreenMode() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function toggleMute() {
    video.muted = !video.muted;
}
