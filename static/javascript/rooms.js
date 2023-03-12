socket.on("info", (data) => {
    printSysMsg(data.msg);
});

// Selecting Rooms
document.querySelectorAll(".contact").forEach((elem) => {
    elem.classList.remove("active");
    elem.onclick = () => {
        if (window.innerWidth <= 600) {
            document.querySelector("#sidebar").style.display = "none";
            document.querySelector("#rightside-panel").style.display = "block";
        }

        document.querySelectorAll(".contact").forEach((notClicked) => {
            notClicked.classList.remove("active");
        });

        elem.classList.toggle("active");

        let newRoom = elem.querySelector("#names").textContent;
        document.querySelector("#profile").classList.remove("invisible");

        if (window.innerWidth <= 600) {
            document.querySelector(".back").addEventListener("click", () => {
                document.querySelector("#rightside-panel").style.display =
                    "none";
                document.querySelector("#sidebar").style.display = "block";
            });
        } else {
            document.querySelector(".back").addEventListener("click", () => {
                document
                    .querySelector(".input-area")
                    .classList.add("invisible");
                document.querySelector("#profile").classList.add("invisible");
                document.querySelector("#display-messages").innerHTML = "";
            });
        }

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

        let lastseen = document.querySelector("#last-seen");
        if (elem.querySelectorAll(".available")[0]) {
            lastseen.innerHTML = `<span class="circle"></span> Online`;
        } else {
            lastseen.innerHTML = "<span class='circle'></span> Offline";
        }

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
