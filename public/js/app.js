

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

// home page
const indexSearchContainer = document.querySelector("#indexSearchContainer");
if (indexSearchContainer) {
    // removing nav when page is index category
    document.querySelector('#nav').style.display = "none";
    // adding class mainIndex to main
    document.querySelector('main').classList.add('mainIndex');
    document.querySelector('footer').style.display = 'none';
    document.querySelector('body').classList.add('bodyIndex')
    const nav = document.querySelector("#nav");
    nav.classList.add('navIndex');
}


// about page
function aboutNavScroll() {
    let div = document.getElementById("aboutNav");
    if (document.body.scrollTop > 170 || document.documentElement.scrollTop > 170) {
        div.style.backgroundColor = '#b0e5b3'
    } else {
        div.style.backgroundColor = 'rgba(0, 0, 0, 0)'
    }
}

function hideFaqAnswer(e) {
    let parent = e.target.parentNode;
    let answerClassList = parent.querySelector('.faqAnswer').classList;
    answerClassList.toggle("faqAnswerHidden")

}

// // category page
// const cardCategory = document.querySelector(".cardCategory");
// cardCategory.addEventListener('mouseover', (e) => {

//     console.log(e)
//     e.target.parentElement.classList.toggle("col-sm-6", "offset-sm-3");
// })


// arrow down index to auto scroll down page 
arrowDownIndex = document.querySelector('#arrowDownIndex');
arrowDownIndex.addEventListener('click', () => {
    window.scrollBy(0, 360);
})