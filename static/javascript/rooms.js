socket.on("info", (data) => {
    printSysMsg(data.msg);
});

// Selecting Rooms
document.querySelectorAll(".contact").forEach((elem) => {
    elem.classList.remove("active");
    elem.onclick = () => {
        document.querySelectorAll(".contact").forEach((notClicked) => {
            notClicked.classList.remove("active");
        });
        elem.classList.toggle("active");

        let newRoom = elem.querySelector("#names").textContent;
        document.querySelector("#profile").classList.remove("invisible");
        document
            .querySelectorAll(".input-area")[0]
            .classList.remove("invisible");
        document.querySelector("#username").innerHTML =
            elem.querySelector(".room-name").textContent;
        document.querySelector(
            "#profile > #profilepic"
        ).innerHTML = `<img src=${
            elem.querySelector("#profilepic > img").src
        } />`;

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
