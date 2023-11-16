const questionTypeOptions = document.querySelector("#questionTypeOptions");
const options = document.querySelectorAll(".options");
// why if ? because at least check first if it is in the page that this code wanted
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
const answerCorrectnessDivs = document.querySelectorAll(".answerCorrectness");
// why if ? because at least check first if it is in the page that this code wanted
if (answerCorrectnessDivs) {
  for (let div of answerCorrectnessDivs) {
    console.log(div.classList);
    if (div.classList.contains("text-success")) {
      div.parentElement.classList.add("correctAnswer");
    } else if (div.classList.contains("text-danger")) {
      div.parentElement.classList.add("wrongAnswer");
    }
  }
}
// home page
const indexSearchContainer = document.querySelector("#indexSearchContainer");
// why if ? because at least check first if it is in the page that this code wanted
if (indexSearchContainer) {
  // removing nav when page is index category
  document.querySelector("#nav").style.display = "none";
  // adding class mainIndex to main
  document.querySelector("main").classList.add("mainIndex");
  document.querySelector("footer").style.display = "none";
  document.querySelector("body").classList.add("bodyIndex");
  const nav = document.querySelector("#nav");
  nav.classList.add("navIndex");
}

// about page
const aboutNav = document.querySelector("#aboutNav");
if (aboutNav) {
  // just to check if user currently in about page
  const faqMain = document.querySelectorAll(".faqMain");
  faqMain.forEach((element) =>
    element.addEventListener("click", function () {
      element.querySelector(".faqAnswer").classList.toggle("faqAnswerHidden");
    })
  );
  window.onscroll = function aboutNavScroll() {
    let div = document.getElementById("aboutNav");
    if (
      document.body.scrollTop > 170 ||
      document.documentElement.scrollTop > 170
    ) {
      div.style.backgroundColor = "#b0e5b3";
    } else {
      div.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
  };
}

// arrow down index to auto scroll down page
arrowDownIndex = document.querySelector("#arrowDownIndex");
if (arrowDownIndex) {
  arrowDownIndex.addEventListener("click", () => {
    window.scrollBy(0, 360);
  });
}
