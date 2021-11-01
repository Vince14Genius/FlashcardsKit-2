'use strict';

let fkErrorMessageElement = null;
let fkFlashcardsTitleElement = null;
let fkIsCurrentFlashcardRevealed = false;
let fkCurrentFlashcardIndex = 0;
let fkFlashcardsList = null;

function dataError() {
    if (fkErrorMessageElement === null) {
        return;
    }
    fkErrorMessageElement.style.visibility = "visible";
    fkErrorMessageElement.style.color = "var(--text-color-warning)";
    fkErrorMessageElement.textContent = "Unable to read the flashcards JSON file. Please try a different one or check your Internet connection."
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function loadJSON() {
    const getJSON = async url => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }

    getJSON(prompt("Enter the URL of the JSON file that contains your flashcards: ")).then(data => {
        fkErrorMessageElement.style.visibility = "hidden";

        if ("name" in data) {
            fkFlashcardsTitleElement.innerHTML = data.name;
        } else {
            dataError();
            return;
        }

        if ("flashcards" in data) {
            fkFlashcardsList = data.flashcards;
            shuffleArray(fkFlashcardsList);

            // reset stuff
            fkCurrentFlashcardIndex = 0;
            fkIsCurrentFlashcardRevealed = false;
            updateView();
        } else {
            dataError();
            return;
        }
    }).catch(error => {
        console.error(error);
        dataError();
    });
}

function updateView() {
    if (fkFlashcardsList === null) {
        return;
    }

    document.getElementById("flashcard-content").style.visibility = "visible";
    document.getElementById("current-flashcard-title").innerHTML = fkFlashcardsList[fkCurrentFlashcardIndex].title;
    document.getElementById("current-flashcard-reveal").innerHTML = fkFlashcardsList[fkCurrentFlashcardIndex].reveal;
    document.getElementById("current-flashcard-reveal").style.display = fkIsCurrentFlashcardRevealed ? "block" : "none";
    document.getElementById("current-flashcard-instructions").innerHTML = fkIsCurrentFlashcardRevealed ? "Tap to continue" : "Tap to reveal";

    const index = fkCurrentFlashcardIndex + 1;
    const max = fkFlashcardsList.length;

    document.getElementById("current-flashcard-index").innerHTML = `${index}/${max}`;
    document.getElementById("current-flashcard-progress").max = max;
    document.getElementById("current-flashcard-progress").value = index;
}

function primaryUserAction() {
    if (fkFlashcardsList === null) {
        return;
    }

    // handle logic

    if (fkIsCurrentFlashcardRevealed) {
        ++fkCurrentFlashcardIndex;
        if (fkCurrentFlashcardIndex >= fkFlashcardsList.length) {
            fkCurrentFlashcardIndex = 0;
        }
    }

    fkIsCurrentFlashcardRevealed = !fkIsCurrentFlashcardRevealed;

    // update view

    updateView();
}

window.addEventListener('load', (event) => {
    fkErrorMessageElement = document.getElementById("error-message");
    fkFlashcardsTitleElement = document.getElementsByClassName("flashcards-title")[0];

    document.getElementById("visible-safe-area").addEventListener('click', primaryUserAction);
});
