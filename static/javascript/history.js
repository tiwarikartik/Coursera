socket.on("pastmessages", (json) => {
    document.querySelector("#display-messages").innerHTML = "";

    json.forEach((data) => {
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

        if (data.type == "text") {
            let txtTemplate = document.querySelector("#chat");
            let txtContent = txtTemplate.content.cloneNode(true);

            if (username == data.sender) {
                txtContent.querySelector("#message").className = "self";
            }

            txtContent.querySelector("#user").append(data.sender);
            txtContent.querySelector("#time").append(time);
            txtContent.querySelector("#message").append(data.message);

            messages.append(txtContent);
        } else if (data.type == "audio") {
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
            console.log(audioContent);
        }
        messages.scrollTo(0, messages.scrollHeight);
    });
});
