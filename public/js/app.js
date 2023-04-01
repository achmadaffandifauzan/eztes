const questionTypeOptions = document.querySelector("#questionTypeOptions");
const options = document.querySelectorAll(".options");
if (questionTypeOptions) {
    questionTypeOptions.addEventListener("change", () => {
        if (questionTypeOptions.value == "essay") {
            for (let option of options) {
                option.setAttribute("disabled", "disabled");
            }
        } else if (questionTypeOptions.value == "options") {
            for (let option of options) {
                option.removeAttribute("disabled");
            }
        }
    });
}
// giving background of answer in evaluate page base on it's correctness (by detecting it's googleIcon's name)
const symbolAnswer = document.querySelectorAll(".material-symbols-rounded");
for (let symbol of symbolAnswer) {
    if (symbol.innerText == "verified" || symbol.innerText == "key") {
        symbol.parentElement.parentElement.classList.add("correctAnswer")
    } else if (symbol.innerText == "block") {
        symbol.parentElement.parentElement.classList.add("wrongAnswer")
    }
};

// removing search in nav when page is index category
const indexSearchContainer = document.querySelector("#indexSearchContainer");
if (indexSearchContainer) {
    document.querySelector('#navSearch').style.display = "none";
    // also making main does not have margin (to make indexSearchContainer fullscreen)
    const main = document.querySelector('main');
    main.style.marginTop = '0px';
    main.style.background = 'linear-gradient(0deg, rgba(29, 33, 78, 1) 0%, rgba(4, 215, 162, 1) 76%)';
    main.style.height = '100%';

    document.querySelector('footer').style.display = 'none';
}