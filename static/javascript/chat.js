const socket = io.connect("");
const messages = document.querySelector("#display-messages");
let room;

// Displaying Received Messages
socket.on("secret", (data) => {
    let arr = data.time.split(" ");
    let date = `${arr[0]} ${arr[1]} ${arr[2]}`;
    let time = `${arr[3]} ${arr[4]}`;

    let dates = document.querySelectorAll(".date");

    if (dates.length == 0) {
        messages.innerHTML += `<div class='date'>${date}</div>`;
    } else {
        let lastdate = dates[dates.length - 1];
        if (lastdate.textContent != date) {
            messages.innerHTML += `<div class='date'>${date}</div>`;
        }
    }

    let txtTemplate = document.querySelector("#chat");
    let txtContent = txtTemplate.content.cloneNode(true);

    txtContent.querySelector("#user").append(data.sender);
    txtContent.querySelector("#time").append(time);
    txtContent.querySelector("#message").append(data.message);

    messages.append(txtContent);
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
