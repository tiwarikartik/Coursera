let backbutton = document.querySelectorAll(".back");

backbutton.forEach((elem) => {
    elem.addEventListener("click", () => {
        document.querySelector("#rightside-panel").innerHTML = "";
    });
});
