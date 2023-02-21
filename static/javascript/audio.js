// Fetching the various DOM Elements
const record = document.querySelector("#record");
const stop = document.querySelector("#stop");

socket.on("audioBlob", (data) => {
    console.log(data);
    // fetching the template from the html and creating an audio card
    const template = document.querySelector("[data-audio-template]");
    const content = template.content.cloneNode(true);
    const audio = content.querySelector("#audio");

    content.querySelector("#clipName").innerText = data.sender;

    // getting the audio Uint8Array and converting to blob
    const blob = new Blob([data.audio_data]);

    const audioURL = URL.createObjectURL(blob);
    audio.src = audioURL;

    content.querySelector("#delete").onclick = (e) => {
        const evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
    };

    messages.appendChild(content);
    messages.scrollTo(0, messages.scrollHeight);
    console.log(content);
});

// Checking if the Navigator API is available on the client machine
if (navigator.mediaDevices) {
    const constraints = { audio: true };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            // Initializing MediaRecorder Instance and adding various events to the buttons
            const mediaRecorder = new MediaRecorder(stream);

            record.addEventListener("click", () => {
                if (mediaRecorder.state == "inactive") {
                    mediaRecorder.start();
                    record.style.background = "red";
                    record.style.color = "black";
                }
            });

            stop.addEventListener("click", () => {
                if (mediaRecorder.state == "recording") {
                    mediaRecorder.stop();
                    record.style.background = "";
                    record.style.color = "";
                }
            });

            mediaRecorder.onstop = (e) => {
                console.log(e);
            };

            // Fetching the recorded audio and converting it into Uint8Array for easy
            // transmission to the server
            mediaRecorder.ondataavailable = (e) => {
                e.data
                    .arrayBuffer()
                    .then((buffer) => {
                        let arr = new Uint8Array(buffer);
                        return arr;
                    })
                    .then((arr) => {
                        let info = {
                            audio_data: arr,
                            sender: username,
                            room: room.toLowerCase(),
                            fileType: "audio",
                        };
                        console.table(arr);
                        socket.emit("audio-data", info);
                    });
            };
        })
        .catch((err) => {
            console.error(`The following error occurred: ${err}`);
        });
}
