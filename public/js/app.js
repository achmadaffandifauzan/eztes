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