// Game state variables
let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let scores = { X: 0, O: 0 };

// DOM elements
const statusDisplay = document.getElementById("status");
const winMessage = document.getElementById("win-message");
const resetButton = document.getElementById("reset-btn");
const cells = document.querySelectorAll(".cell");

// Winning combinations
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// Messages
const winningMessage = () => `Player ${currentPlayer} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `Player ${currentPlayer}'s turn`;

// Initialize game
statusDisplay.innerHTML = currentPlayerTurn();

// Handle cell click
function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = parseInt(cell.getAttribute("data-cell-index"));

  // Check if cell is already played or game is inactive
  if (gameBoard[cellIndex] !== "" || !gameActive) {
    return;
  }

  // Update game state and UI
  gameBoard[cellIndex] = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

  // Add animation class for the piece
  cell.classList.add("popIn");

  // Remove animation class after it completes
  setTimeout(() => {
    cell.classList.remove("popIn");
  }, 300);

  // Check for win or draw
  if (checkWin()) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
  }
}

// Check for win
function checkWin() {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];

    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      // Highlight winning cells
      cells[a].classList.add("win");
      cells[b].classList.add("win");
      cells[c].classList.add("win");

      return true;
    }
  }
  return false;
}

// Check for draw
function isDraw() {
  return !gameBoard.includes("");
}

// End game
function endGame(draw) {
  gameActive = false;

  if (draw) {
    statusDisplay.innerHTML = drawMessage();
    winMessage.innerHTML = drawMessage();
  } else {
    statusDisplay.innerHTML = winningMessage();
    winMessage.innerHTML = winningMessage();

    // Update score
    scores[currentPlayer]++;
    updateScore();
  }

  winMessage.style.display = "block";
}

// Update score display
function updateScore() {
  document.getElementById("score-x").textContent = scores.X;
  document.getElementById("score-o").textContent = scores.O;
}

// Reset game
function resetGame() {
  currentPlayer = "X";
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;

  statusDisplay.innerHTML = currentPlayerTurn();
  winMessage.style.display = "none";

  // Clear board
  cells.forEach((cell) => {
    cell.classList.remove("x", "o", "win");
    cell.textContent = "";
  });
}

// Event listeners
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);

// Initialize score display
updateScore();
