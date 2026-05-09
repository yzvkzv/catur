// 1. Inisialisasi Game
var board = null;
var game = new Chess();
var $status = $('#status');

// 2. Fungsi Evaluasi (Memberi skor pada setiap bidak)
function evaluateBoard(game) {
    var totalEvaluation = 0;
    var value = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900 };

    game.board().forEach(row => {
        row.forEach(piece => {
            if (piece) {
                var val = value[piece.type];
                totalEvaluation += (piece.color === 'b' ? val : -val);
            }
        });
    });
    return totalEvaluation;
}

// 3. Algoritma Minimax (Otak AI untuk prediksi langkah)
function minimax(game, depth, isMaximizingPlayer) {
    if (depth === 0) return -evaluateBoard(game);

    var possibleMoves = game.moves();
    if (isMaximizingPlayer) {
        var bestEval = -9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            game.move(possibleMoves[i]);
            bestEval = Math.max(bestEval, minimax(game, depth - 1, false));
            game.undo();
        }
        return bestEval;
    } else {
        var bestEval = 9999;
        for (var i = 0; i < possibleMoves.length; i++) {
            game.move(possibleMoves[i]);
            bestEval = Math.min(bestEval, minimax(game, depth - 1, true));
            game.undo();
        }
        return bestEval;
    }
}

// 4. Fungsi Gerakan AI
function makeProMove() {
    var possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    var bestMove = null;
    var bestValue = -9999;

    for (var i = 0; i < possibleMoves.length; i++) {
        var move = possibleMoves[i];
        game.move(move);
        var boardValue = minimax(game, 2, false); // Kedalaman 2 langkah
        game.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    game.move(bestMove || possibleMoves[0]);
    board.position(game.fen());
    updateStatus();
}

// 5. Aturan Drag & Drop
function onDragStart (source, piece, position, orientation) {
    if (game.game_over()) return false;
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop (source, target) {
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';
    updateStatus();
    window.setTimeout(makeProMove, 500);
}

// 6. Update Tampilan Status
function updateStatus () {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Hitam (AI)' : 'Putih (Kamu)';
    if (game.in_checkmate()) status = 'Skakmat! ' + moveColor + ' kalah.';
    else if (game.in_draw()) status = 'Game Over, Seri.';
    else {
        status = 'Giliran: ' + moveColor;
        if (game.in_check()) status += ' (SKAK!)';
    }
    $status.html(status);
}

// 7. Konfigurasi & Inisialisasi Papan
var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};
board = Chessboard('myBoard', config);
updateStatus();

// 8. Tombol Reset
document.getElementById('resetBtn').onclick = function() {
    game.reset();
    board.start();
    updateStatus();
};