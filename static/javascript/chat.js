const socket = io.connect("");
let room;

// Displaying Received Messages
socket.on("secret", (data) => {
    console.log(data);
    const messages = document.querySelector("#display-messages");
    const template = document.querySelector("#chat");
    const content = template.content.cloneNode(true);

    content.querySelector("#user").append(data.username);
    content.querySelector("#time").append(data.timestamp);
    content.querySelector("#message").append(data.msg);

    messages.append(content);
});

socket.on("pastmessages", (json) => {
    console.log(json);
    document.querySelector("#display-messages").innerHTML = "";
    json.forEach((data) => {
        const messages = document.querySelector("#display-messages");
        const template = document.querySelector("#chat");
        const content = template.content.cloneNode(true);

        content.querySelector("#user").append(data.username);
        content.querySelector("#time").append(data.timestamp);
        content.querySelector("#message").append(data.message);

        messages.append(content);
    });
});

socket.on("info", (data) => {
    printSysMsg(data.msg);
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

// Selecting Rooms
document.querySelectorAll(".select-room").forEach((p) => {
    p.onclick = () => {
        let newRoom = p.innerHTML;
        if (newRoom == room) {
            msg = `You are already in ${room} room.`;
            printSysMsg(msg);
        } else {
            if (room) {
                leaveRoom(room);
            }
            joinRoom(newRoom);
            room = newRoom;
            socket.emit("history", {
                user: username,
                room: room.toLowerCase(),
            });
            console.log(room);
        }
    };
});

// Leave a room
function leaveRoom(room) {
    socket.emit("leave", { username: username, room: room });
}

// Join a room
function joinRoom(room) {
    socket.emit("join", { username: username, room: room });
    document.querySelector("#display-messages").innerHTML = "";
}

// Printing System Messages
function printSysMsg(msg) {
    const p = document.createElement("p");
    p.innerHTML = msg;
    document.querySelector("#display-messages").append(p);
}
