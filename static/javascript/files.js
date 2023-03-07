let sizeOf = function (bytes) {
    if (bytes == 0) {
        return "0.00 B";
    }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
        (bytes / Math.pow(1024, e)).toFixed(2) + " " + " KMGTP".charAt(e) + "B"
    );
};

let attachemntBtn = document.querySelector("#file-btn");
socket.on("file-receiver", (json) => {
    console.log(json);
    messages.innerHTML = "";
    socket.emit("history", {
        user: username,
        room: room.toLowerCase(),
    });
    fileRenderer(json);
});

attachemntBtn.addEventListener("click", () => {
    messages.innerHTML = "";
    messages.innerHTML += `<section class='selection'>
        <form action="#" id='file-upload'>
            <input type="file" id="file-input" hidden />
            <lord-icon
                class='upload-file-icon'
                src="https://cdn.lordicon.com/yzqrwwtj.json"
                trigger="boomerang"
                colors="primary:#2A85FF">
            </lord-icon>
            <h1 class='title'>Upload a file</h1>
            <p class='desc'>Click anywhere to upload the documents</p>
        </form></section>`;
});

attachemntBtn.addEventListener("click", () => {
    const form = document.querySelector("#file-upload");
    let fileInput = document.querySelector("#file-input");

    form.addEventListener("click", () => {
        fileInput.click();
    });
    console.log(room);

    fileInput.addEventListener("change", (e) => {
        console.log(room);
        let file = e.target.files[0];
        let json = file
            .arrayBuffer()
            .then((buffer) => {
                let arr = new Uint8Array(buffer);
                return arr;
            })
            .then((arr) => {
                data = {
                    user: username,
                    room: room.toLowerCase(),
                    lastModified: file.lastModified,
                    type: file.type,
                    name: file.name,
                    size: sizeOf(file.size),
                    blob: arr,
                };
                return data;
            })
            .then((data) => {
                console.log(socket);
                socket.emit("file-sender", data);
            });
        console.log(json);
    });
});
