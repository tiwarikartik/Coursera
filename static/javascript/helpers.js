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
        lastMessage.innerHTML += `<p class='message'>${data.message}</p>`;
    } else {
        let txtTemplate = document.querySelector("#chat");
        let txtContent = txtTemplate.content.cloneNode(true);
        let chatContainer = txtContent.querySelector("#chat-container");

        if (username == data.sender) {
            chatContainer.setAttribute("class", "right");
        }

        txtContent.querySelector("#user").append(data.sender);
        txtContent.querySelector(
            "#profilepic > img"
        ).src = `http://127.0.0.1:5000/profilepic/${data.sender}`;
        txtContent.querySelector("#time").append(time);
        txtContent.querySelector(".message").append(data.message);
        messages.append(txtContent);
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
    let arr = data.time.split(" ");
    let time = `${arr[3]} ${arr[4]}`;
    let fileTemplate = document.querySelector("#file-template");
    let fileContent = fileTemplate.content.cloneNode(true);
    let url = `http://127.0.0.1:5000/sharedfiles/${data.id}`;
    let file = data.type.split("/")[0];

    if (file == "image") {
        let txtTemplate = document.querySelector("#chat");
        let txtContent = txtTemplate.content.cloneNode(true);
        let chatContainer = txtContent.querySelector("#chat-container");
        let img = txtContent.querySelectorAll(".flex-col")[0];

        if (username == data.sender) {
            chatContainer.setAttribute("class", "right");
        }

        txtContent.querySelector("#user").append(data.sender);
        txtContent.querySelector(
            "#profilepic > img"
        ).src = `http://127.0.0.1:5000/profilepic/${data.sender}`;
        txtContent.querySelector("#time").append(time);
        txtContent.querySelector(".message").remove();
        img.classList.add("img-col");
        img.innerHTML = `<img class="img" src="${url}"></img>`;
        messages.append(txtContent);

        messages.scrollTo(0, messages.scrollHeight);
    } else if (file == "video") {
        let videoTemplate = document.querySelector("#video-template");
        let videoContent = videoTemplate.content.cloneNode(true);
        videoContent.querySelector("video").src = url;
        messages.append(txtContent);
        messages.scrollTo(0, messages.scrollHeight);
    } else {
        fileContent.querySelector(".doc-title").append(data.fileName);
        fileContent.querySelector(".doc-size").append(data.fileSize);
        fileContent
            .querySelector(".attachment")
            .addEventListener("click", () => {
                window.open(url, "_blank");
            });
        fileContent.querySelector(".doc-download").href = url;
        fileContent.querySelector(".doc-download").download = data.fileName;

        messages.append(fileContent);
    }
}
