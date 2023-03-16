const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const cellSize = 10;
const rows = 50;
const cols = 50;
const colors = {
    green: 'green',
    blue: 'blue',
    black: 'black',
    yellow: 'yellow',
};

const weaknesses = {
    yellow: colors.green,
    green: colors.blue,
    blue: colors.black,
    black: colors.yellow,
};

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let board = createEmptyBoard();
let interval;
let isDrawing = false;
let selectedColor = colors.green;

document.getElementById('colors').addEventListener('change', (e) => {
    selectedColor = e.target.value;
});

document.getElementById('start').addEventListener('click', () => {
    clearInterval(interval);
    interval = setInterval(nextGeneration, 1000 / document.getElementById('speed').value);
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
});

document.getElementById('clear').addEventListener('click', () => {
    clearInterval(interval);
    board = createEmptyBoard();
    drawBoard();
});

document.getElementById('speed').addEventListener('input', (e) => {
    clearInterval(interval);
    interval = setInterval(nextGeneration, 1000 / e.target.value);
});

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const x = Math.floor(e.offsetX / cellSize);
    const y = Math.floor(e.offsetY / cellSize);
    board[y][x] = selectedColor;
    drawBoard();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const x = Math.floor(e.offsetX / cellSize);
    const y = Math.floor(e.offsetY / cellSize);
    board[y][x] = selectedColor;
    drawBoard();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

function createEmptyBoard() {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            ctx.strokeStyle = 'lightgrey';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function nextGeneration() {
    const newBoard = createEmptyBoard();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const neighbors = getNeighbors(x, y);
            const aliveNeighbors = neighbors.filter(n => n).length;
            const cell = board[y][x];

            if (cell) {
                if (aliveNeighbors === 2 || aliveNeighbors === 3) {
                    newBoard[y][x] = cell;
                }
                const changeColor = neighbors.find(n => n === weaknesses[cell]);
                if (changeColor) {
                    newBoard[y][x] = changeColor;
                }
            } else if (aliveNeighbors === 3) {
                const dominantNeighbor = getDominantNeighbor(neighbors);
                if (dominantNeighbor) {
                    newBoard[y][x] = dominantNeighbor;
                }
            }
        }
    }

    board = newBoard;
    drawBoard();
}

function getDominantNeighbor(neighbors) {
    const colorCounts = {
        green: 0,
        blue: 0,
        black: 0,
        yellow: 0,
    };

    neighbors.forEach(neighbor => {
        if (neighbor) {
            colorCounts[neighbor]++;
        }
    });

    const dominantColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    return colorCounts[dominantColor] > 0 ? dominantColor : null;
}

function getNeighbors(x, y) {
    const neighbors = [];
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
            if (xOffset === 0 && yOffset === 0) continue;
            const newY = (y + yOffset + rows) % rows;
            const newX = (x + xOffset + cols) % cols;
            neighbors.push(board[newY][newX]);
        }
    }
    return neighbors;
}

drawBoard();    
