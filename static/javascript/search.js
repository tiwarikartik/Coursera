const userCardTemplate = document.querySelector("[data-card-template]");
const userCardContainer = document.querySelector("[data-user-card-container");
const searchInput = document.querySelector("[data-search]");

let users = [];

searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    users.forEach((user) => {
        const isVisible =
            user.name.toLowerCase().includes(value) ||
            user.email.toLowerCase().includes(value);
        user.element.classList.toggle("hide", !isVisible);
    });
});

searchInput.addEventListener(
    "click",
    () => {
        fetch("/api/10")
            .then((res) => res.json())
            .then((data) => {
                users = data.map((user) => {
                    const card =
                        userCardTemplate.content.cloneNode(true).children[0];
                    const header = card.querySelector("[data-header]");
                    const body = card.querySelector("[data-body]");
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
    },
    { once: true }
);
