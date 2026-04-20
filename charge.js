const readline = require('node:readline/promises');
const {stdin: input, stdout: output} = require('node:process');
const rl = readline.createInterface({input, output});

class Move {
    constructor(name, cost, type, beats) {
        this.name = name;
        this.cost = cost;
        this.type = type;
        if (beats)
            this.beats = beats;
    }
};

const moves = new Map();

moves.set('Charge', new Move('Charge', -1, 'charge'));
moves.set('Bang Block', new Move('Bang Block', 0, 'defense'));
moves.set('Spell Block', new Move('Spell Block', 0, 'defense'));
moves.set('Slash Block', new Move('Slash Block', 0, 'defense'));
moves.set('Bang', new Move('Bang', 1, 'attack', [
    moves.get('Charge'),
    moves.get('Spell Block'), 
    moves.get('Slash Block')
]));
moves.set('Spell', new Move('Spell', 3, 'attack', [
    moves.get('Charge'), 
    moves.get('Bang'), 
    moves.get('Bang Block'), 
    moves.get('Slash Block')
]));
moves.set('Slash', new Move('Slash', 4, 'attack', [
    moves.get('Charge'), 
    moves.get('Bang'), 
    moves.get('Spell'),
    moves.get('Bang Block'), 
    moves.get('Spell Block')
]));

let isGameOngoing = true;
let turn = 1;
let playerCharges = 2;
let opponentCharges = 2;
let playerMove;
let opponentMove;
let result;

async function promptPlayerMove() {
    let retVal;
    let playerMove;

    do {
        playerMove = await rl.question("What's your move? ");
        retVal = moves.has(playerMove) ? moves.get(playerMove) : null;
    } while (!retVal);

    return retVal;
}

function generateOpponentMove() {
    let opponentValidMoves;
    let opponentMove;

    if (playerCharges <= 2) {
        opponentValidMoves = [...moves.values()].filter(move => move.cost <= opponentCharges && !move.name.includes("Slash Block") && !move.name.includes("Spell Block"));
    } else if (playerCharges <= 3) {
        opponentValidMoves = [...moves.values()].filter(move => move.cost <= opponentCharges && !move.name.includes("Slash Block"));
    } else {
        opponentValidMoves = [...moves.values()].filter(move => move.cost <= opponentCharges);
    }

    opponentMove = opponentValidMoves[Math.floor(Math.random() * opponentValidMoves.length)];

    return opponentMove;
}

async function promptPlayAgain() {
    let choice = await rl.question('Play Again? ');
    choice = choice.toLowerCase();

    return choice === 'yes'
}

function resetGame() {
    turn = 1;
    playerCharges = 2;
    opponentCharges = 2;
    playerMove = null;
    opponentMove = null;
    result = null;
}

async function play() {
    while (isGameOngoing) {
        console.log(`Turn ${turn}`);
        console.log(`Your Charges: ${playerCharges}`);
        console.log(`Opponent Charges: ${opponentCharges}`);

        playerMove = await promptPlayerMove();
        opponentMove = generateOpponentMove();

        playerCharges -= playerMove.cost;
        opponentCharges -= opponentMove.cost;

        result = playerCharges < 0 ? 'POOF! Opponent wins.' : playerMove.beats && playerMove.beats.includes(opponentMove) ? 'You Win!' : opponentMove.beats && opponentMove.beats.includes(playerMove) ? 'Opponent Wins!' : 'Game continues.';

        console.log(`Your Move: ${playerMove.name}`);
        console.log(`Opponent Move: ${opponentMove.name}`);
        console.log(`${result}\n`);

        turn++;

        if (!(result === 'Game continues.')) {
            const playAgain = await promptPlayAgain();
            if (playAgain) {
                resetGame();
            } else {
                isGameOngoing = false;
                rl.close();
            }
        }
    }
}

play();