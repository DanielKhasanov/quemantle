import { GAMES, WORDS } from "./words.js";


// Game configuration
const NUMBER_OF_GUESSES = 8;
let green = "#90be6d"; // "#90BE6D";
let yellow = "#f9c74f";
let gray = "gray";
let black = "black";

// Game ID from URL
const urlParams = new URLSearchParams(window.location.search);
let gameIDString = urlParams.get('game-id');
let gameID = parseInt(gameIDString);
if (isNaN(gameID)) {
    gameID = Math.floor(Math.random() * GAMES.length);
}

// Game instantiation from Game ID
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let thisGame = GAMES[gameID];
let rightGuessStrings = thisGame.slice(1,5);
let clue = thisGame[0];
let game_overs = [0,0,0,0];
let gameColors = [];


console.log(thisGame);

function initBoard() {
  document.getElementById("title").innerHTML = `Quemantle #${gameID}`;
  document.getElementById("clue").innerHTML = clue;
  for (let game=0; game < 4; game++) {
      let gameColor = [];
      gameColors.push(gameColor);
      let board = document.querySelector(`#game-board-${game}`);
      for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let rowColor = [];
        gameColor.push(rowColor);
        let row = document.createElement("div");
        row.className = `letter-row`;

        for (let j = 0; j < 5; j++) {
          rowColor.push(black);
          let box = document.createElement("div");
          box.className = "box";
          row.appendChild(box);
        }
        board.appendChild(row);
      }
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === green) {
        return;
      }

      if (oldColor === yellow && color !== green) {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  for (let game=0; game < 4; game++) {
      let board = document.querySelector(`#game-board-${game}`);
      let row = board.children[NUMBER_OF_GUESSES - guessesRemaining];
      let box = row.children[nextLetter - 1];
      box.textContent = "";
      box.classList.remove("filled-box");
  }
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let guessString = "";
  for (const val of currentGuess) {
    guessString += val;
  }
  if (guessString.length != 5) {
    toastr.error("Not enough letters!");
    return;
  }
  if (!WORDS.includes(guessString)) {
    toastr.error("Word not in list!");
    return;
  }
  for (let game=0; game < 4; game++) {
      if (game_overs[game] !== 0) {
          continue;
      }
      let rightGuessString = rightGuessStrings[game];
      if (rightGuessString === guessString) {
          game_overs[game] = NUMBER_OF_GUESSES - guessesRemaining + 1;
      }
      let board = document.querySelector(`#game-board-${game}`);
      let rowIdx = NUMBER_OF_GUESSES - guessesRemaining;
      let row = board.children[rowIdx];
      let rightGuess = Array.from(rightGuessString);
      var letterColor = gameColors[game][rowIdx];
      //check green
      for (let i = 0; i < 5; i++) {
        letterColor[i] = gray;
        if (rightGuess[i] == currentGuess[i]) {
          letterColor[i] = green;
          rightGuess[i] = "#";
        }
      }
      //check yellow
      //checking guess letters
      for (let i = 0; i < 5; i++) {
        if (letterColor[i] == green) continue;
        //checking right letters
        for (let j = 0; j < 5; j++) {
          if (rightGuess[j] == currentGuess[i]) {
            letterColor[i] = yellow;
            rightGuess[j] = "#";
          }
        }
      }
      for (let i = 0; i < 5; i++) {
        let box = row.children[i];
        let delay = 250 * i;
        let colorsCopy = [...letterColor]
        setTimeout(() => {
          //flip box
          animateCSS(box, "flipInX");
          //shade box
          box.style.backgroundColor = colorsCopy[i];
          shadeKeyBoard(guessString.charAt(i) + "", colorsCopy[i]);
        }, delay);
      }
  }
  if (!game_overs.includes(0)) {
    toastr.success("You guessed right! Game over!");
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;
    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right words were: "${rightGuessStrings}"`);
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  for (let game=0; game < 4; game++) {
      if (game_overs[game] !== 0) {
          continue;
      }
      let board = document.querySelector(`#game-board-${game}`);
      let row = board.children[NUMBER_OF_GUESSES - guessesRemaining];
      let box = row.children[nextLetter];
      animateCSS(box, "pulse");
      box.textContent = pressedKey;
      box.classList.add("filled-box");
  }
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

function gameScoreEmoji(idx) {
    let emojis = ['💀', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    return emojis[game_overs[idx]];
};


function gameRowRepr(idx, rowIdx) {
    let grayEmoji = '⬜';
    let yellowEmoji = '🟨';
    let greenEmoji = '🟩';
    let blackEmoji = '⬛';
    
    let gameString = ''
    let board = document.querySelector(`#game-board-${idx}`); 
    let rowString = ''
    let row = board.children[rowIdx];
    for (let i=0; i < 5; i++) {
        let color = gameColors[idx][rowIdx][i];
        if (color === green) {
            rowString += greenEmoji
        } else if (color === yellow) {
            rowString += yellowEmoji
        } else if (color === gray) {
            rowString += grayEmoji
        } else {
            rowString += blackEmoji
        }
    }
    return rowString
};

function gameRepr() {
    let gamesString = ''
    for (let j=0; j < NUMBER_OF_GUESSES; j++) {
        gamesString += gameRowRepr(0,j) + ' ' + gameRowRepr(1,j) + '\n'
    }
    gamesString += '\n';
    for (let j=0; j < NUMBER_OF_GUESSES; j++) {
        gamesString += gameRowRepr(2,j) + ' ' + gameRowRepr(3,j) + '\n'
    }
    return gamesString
}

function copyPermissions() {
    navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
        // If permission to read the clipboard is granted or if the user will
        // be prompted to allow it, we proceed.
        if (result.state === 'granted' || result.state === 'prompt') {
            return true;
        }
      }).catch(error => {
                     console.log((error));
                 });
      return false;
}

function copyGame() {
    
    let gameString1 = gameScoreEmoji(0);
    let gameString2 = gameScoreEmoji(1);
    let gameString3 = gameScoreEmoji(2);
    let gameString4 = gameScoreEmoji(3);
    
    let gameFull = gameRepr();
    
    let text = `Quemantle ${gameID}
${gameString1}${gameString2}
${gameString3}${gameString4}
https://dkhasanov.com:9002/?game-id=${gameID}
${gameFull}
`
  navigator.clipboard.writeText(text)
    .then(text => {
         alert("Copied results to clipboard!");
     })
     .catch(err => {
         alert('Failed to read clipboard contents: ', err);
         console.error('Failed to read clipboard contents: ', err);
     });
    
  let copyTextContainer = document.querySelector(`.copy-text-container`);
  if (copyTextContainer.childElementCount < 1) {
      let ct = document.createElement("textarea");
      ct.id = "copy-text";
      ct.className = "overflow-auto";
      ct.rows = NUMBER_OF_GUESSES * 2 + 11;
      ct.cols = 30;
      copyTextContainer.appendChild(ct);
  }
  let copyText = document.querySelector(`#copy-text`);
  copyText.value = text;
};

document.querySelector('#copy-button').addEventListener("click", copyGame);


initBoard();
