const socket = io.connect("");
let messages = document.querySelector("#display-messages");
let room;

socket.on("connect", () => {
    console.log("Connected");
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

// Displaying Received Messages
socket.on("secret", (data) => {
    textRenderer(data);
    messages.scrollTo({ bottom: 0, behavior: "smooth" });
});

socket.on("pastmessages", (json) => {
    document.querySelector("#display-messages").innerHTML = "";
    json.forEach((data) => {
        console.log(data.type);
        if (data.type == null) textRenderer(data);
        else if (data.type == "audio") audioRenderer(data);
        else fileRenderer(data);
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
