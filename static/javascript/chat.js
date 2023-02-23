const socket = io.connect("");
let messages = document.querySelector("#display-messages");
let room;

// Displaying Received Messages
socket.on("secret", (data) => {
    textRenderer(data);
    messages.scrollTo({ bottom: 0, behavior: "smooth" });
});

socket.on("pastmessages", (json) => {
    document.querySelector("#display-messages").innerHTML = "";
    json.forEach((data) => {
        if ((data.type = "text")) textRenderer(data);
        else if (data.type == "audio") {
            let audioTemplate = document.querySelector("[data-audio-template]");
            let audioContent = audioTemplate.content.cloneNode(true);
            let audio = audioContent.querySelector("#audio");

            audioContent.querySelector("#clipName").innerText = data.sender;

            // getting the audio Uint8Array and converting to blob
            let blob = new Blob([data.binary]);

            let audioURL = URL.createObjectURL(blob);
            audio.src = audioURL;

            audioContent.querySelector("#delete").onclick = (e) => {
                let evtTgt = e.target;
                evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
            };

            messages.appendChild(audioContent);
            console.log(audioContent);
        }
    });
});

socket.on("createRoom", (data) => {});

// Sending Messages
document.querySelector("#send-message").onclick = () => {
    if (room) {
        const input = document.querySelector("#user-message");
        let json = {
            msg: input.value,
            username: username,
            room: room.toLowerCase(),
        };
        socket.send(json);
        input.value = "";
    }
};

// Printing System Messages
function printSysMsg(msg) {
    const p = document.createElement("p");
    p.innerHTML = msg;
    document.querySelector("#display-messages").append(p);
}
