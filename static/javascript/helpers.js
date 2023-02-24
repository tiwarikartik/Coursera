function textRenderer(data) {
    let arr = data.time.split(" ");
    let date = `${arr[0]} ${arr[1]} ${arr[2]}`;
    let time = `${arr[3]} ${arr[4]}`;
    let lastMessage, lastSender, lastSentTime;
    let allMessage = document.querySelectorAll("#chat-container");
    let dates = document.querySelectorAll(".date");

    if (dates.length == 0) {
        messages.innerHTML += `<div class='date'>${date}</div>`;
    } else {
        let lastdate = dates[dates.length - 1];
        if (lastdate.textContent != date) {
            messages.innerHTML += `<div class='date'>${date}</div>`;
        }
    }
    try {
        lastSender =
            allMessage[allMessage.length - 1].querySelector(
                "#user"
            ).textContent;
        lastSentTime =
            allMessage[allMessage.length - 1].querySelector(
                "#time"
            ).textContent;
    } catch (err) {
        console.log("error occured");
    }

    if (data.sender == lastSender && time == lastSentTime) {
        allMessage = document.querySelectorAll("#chat-container");
        lastMessage =
            allMessage[allMessage.length - 1].querySelector(".flex-col");
        console.log(lastMessage);
        lastMessage.innerHTML += `<p class='message'>${data.message}</p>`;
    } else {
        let txtTemplate = document.querySelector("#chat");
        let txtContent = txtTemplate.content.cloneNode(true);
        let chatContainer = txtContent.querySelector("#chat-container");

        if (username == data.sender) {
            chatContainer.setAttribute("class", "right");
        }

        txtContent.querySelector("#user").append(data.sender);
        txtContent.querySelector("#time").append(time);
        txtContent.querySelector(".message").append(data.message);
        messages.append(txtContent);
        console.log(messages.scrollHeight);
        messages.scrollTo(0, messages.scrollHeight);
    }
}

function audioRenderer(data) {
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
}

function fileRenderer(data) {
    console.log(data);
    let arrayBuffer = data.file;
    // let date = new Date(json.lastModified
    let file = new File([arrayBuffer], data.name, { type: data.type });
    let url = URL.createObjectURL(file);
    let fileTemplate = document.querySelector("#file-template");
    let fileContent = fileTemplate.content.cloneNode(true);

    fileContent.querySelector(".doc-title").append(data.fileName);
    fileContent.querySelector(".doc-size").append(data.fileSize);
    fileContent.querySelector(".attachment").addEventListener("click", () => {
        window.open(url, "_blank");
    });
    fileContent.querySelector(".doc-download").href = url;
    fileContent.querySelector(".doc-download").download = data.name;

    messages.append(fileContent);
    // fileContent.querySelector("#date").append(
    //     `${date.getUTCDate()}
    //             /${date.getMonth() + 1}
    //             /${date.getUTCFullYear()}`
    // );
}
