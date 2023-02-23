function textRenderer(data) {
    let messages = document.body.querySelector("#display-messages");
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
