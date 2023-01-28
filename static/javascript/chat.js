document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect("http://127.0.0.1:5000");
    let room;

    // Displaying Received Messages
    socket.on("message", (data) => {
        console.log(data);
        const messages = document.querySelector("#display-messages");
        const template = document.querySelector("#chat");
        const content = template.content.cloneNode(true);

        content.querySelector("#user").append(data.username);
        content.querySelector("#time").append(data.timestamp);
        content.querySelector("#message").append(data.msg);

        messages.append(content);
    });

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

    socket.on("left", (data) => {
        printSysMsg(data.msg);
    });

    socket.on("joined", (data) => {
        printSysMsg(data.msg);
    });

    // Sending Messages
    document.querySelector("#send-message").onclick = () => {
        if (room) {
            const input = document.querySelector("#user-message");
            let json = { msg: input.value, username: username, room: room };
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
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
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
});
