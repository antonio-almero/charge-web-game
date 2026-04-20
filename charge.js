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

$(function() {
    updateDisplay();

    $('.move-button').on('click', function() {
        playerMove = moves.get($(this).html());
        opponentMove = generateOpponentMove();

        playerCharges -= playerMove.cost;
        opponentCharges -= opponentMove.cost;

        result = playerCharges < 0 ? 'POOF! Opponent wins.' : playerMove.beats && playerMove.beats.includes(opponentMove) ? 'You Win!' : opponentMove.beats && opponentMove.beats.includes(playerMove) ? 'Opponent Wins!' : 'Game continues.';

        turn++;

        updateDisplay(result);
    });

    $('#play-again-button').on('click', function() {
        resetGame();
        $('.game-container').css('display', 'flex');
        $('.play-again-container').css('display', 'none');
        updateDisplay('');
    });
});

function updateDisplay(result) {
    $('#result').html(result);

    if (turn === 1 || result === 'Game continues.') {
        $('#turn-number').html(turn);
        $('#player-charge-count').html(playerCharges);

        if (playerMove) {
            $('#player-move').css('display', 'block');
            $('#player-move').html(`Your Move: ${playerMove.name}`);
        } else {
            $('#player-move').css('display', 'none');
        }

        if (opponentMove) {
            $('#opponent-move').css('display', 'block');
            $('#opponent-move').html(`Opponent Move: ${opponentMove.name}`);
        } else {
            $('#opponent-move').css('display', 'none');
        }
    } else {
        $('#player-move').css('display', 'block');
        $('#player-move').html(`Your Move: ${playerMove.name}`);

        $('#opponent-move').css('display', 'block');
        $('#opponent-move').html(`Opponent Move: ${opponentMove.name}`);
        
        $('.game-container').css('display', 'none');
        $('.play-again-container').css('display', 'flex');
    }
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

function resetGame() {
    turn = 1;
    playerCharges = 2;
    opponentCharges = 2;
    playerMove = null;
    opponentMove = null;
    result = null;
}