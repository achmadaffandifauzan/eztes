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
const navSearch = document.querySelector("#navSearch");
