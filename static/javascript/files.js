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
    let arrayBuffer = json.file;
    let date = new Date(json.lastModified);
    let file = new File([arrayBuffer], json.name, { type: json.type });
    let url = URL.createObjectURL(file);

    let fileTemplate = document.querySelector("#file-template");
    let fileContent = fileTemplate.content.cloneNode(true);

    fileContent.querySelector(".doc-title").append(json.name);
    fileContent.querySelector(".doc-size").append(json.size);
    fileContent.querySelector(".attachment").addEventListener("click", () => {
        window.open(url, "_blank");
    });
    fileContent.querySelector(".doc-download").href = url;
    fileContent.querySelector(".doc-download").download = json.name;
    // fileContent.querySelector("#date").append(
    //     `${date.getUTCDate()}
    //             /${date.getMonth() + 1}
    //             /${date.getUTCFullYear()}`
    // );
    messages.innerHTML = "";
    socket.emit("history", {
        user: username,
        room: room.toLowerCase(),
    });
    setTimeout(() => {
        messages.append(fileContent);
    }, 2000);
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
                colors="primary:#ff5252">
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

    fileInput.addEventListener("change", (e) => {
        let file = e.target.files[0];
        console.log(file);

        socket.emit("file-sender", {
            lastModified: file.lastModified,
            type: file.type,
            name: file.name,
            size: sizeOf(file.size),
            file: file,
        });
    });
});
