const userCardTemplate = document.querySelector("[data-card-template]");
const userCardContainer = document.querySelector("[data-user-card-container");
const searchInput = document.querySelector("[data-search]");

let users = [];

searchInput.addEventListener("input", (e) => {
    if (e.target.value == "") {
        location.reload();
        return;
    }
    fetch("/api/" + e.target.value.toLowerCase())
        .then((res) => res.json())
        .then((data) => {
            userCardContainer.innerHTML = "";
            userCardContainer.innerHTML =
                "<div id='messages-title'>Search Results</div>";

            users = data.map((user) => {
                const card =
                    userCardTemplate.content.cloneNode(true).children[0];

                const header = card.querySelectorAll(".room-name")[0];
                const body = card.querySelectorAll(".latest-msg")[0];

                header.textContent = user.username;
                body.textContent = user.email;

                listener = card.addEventListener(
                    "click",
                    () => {
                        leaveRoom(room);
                        socket.emit("room", {
                            receiver: user.username,
                            requestor: username,
                        });
                    },
                    { once: true }
                );

                userCardContainer.append(card);
                return {
                    name: user.username,
                    email: user.email,
                    element: card,
                };
            });
        });
});
