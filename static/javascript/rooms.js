socket.on("info", (data) => {
    printSysMsg(data.msg);
});

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
    messages.innerHTML = "";
}
