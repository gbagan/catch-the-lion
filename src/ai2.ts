import { countIf, partition } from "./util";
import { movesDict, type Piece, type PieceType, piecesEq } from "./model";

const pieceValue: Record<PieceType, number> = {
  L: 1000,
  H: 60,
  G: 30,
  E: 30,
  C: 10,
};

function possibleMoves(pieces: Piece[], turn: 0 | 1) {
  const result: [number, number][] = [];
  const board: number[] = new Array(12);
  board.fill(0);
  for (const piece2 of pieces) {
    if (piece2.position !== null) {
      board[piece2.position] = piece2.owner + 1
    }
  }

  for (let i = 0; i < 8; i++) {
    const piece = pieces[i];
    if (piece.owner !== turn) {
      continue;
    }
    if (piece.position === null) {
      if (i < 4 || pieces[i - 4].owner !== piece.owner || pieces[i - 4].position !== null) {
        for (let j = 0; j < 12; j++) {
          if (!board[j]) {
            result.push([i, j])
          }
        }
      }
    } else {
      const x = piece.position % 3;
      const y = piece.position / 3 | 0;
      const moves = movesDict[piece.type];
      for (const move of moves) {
        const [dx, dy] = turn ? [move[0], move[1]] : [-move[0], -move[1]];
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 4) {
          const index = 3 * y2 + x2;
          if (board[index] !== piece.owner + 1) {
            result.push([i, index]);
          }
        }
      }
    }
  }
  return result
}

function playMove(pieces: Piece[], [from, to]: [number, number]): Piece[] {
  const { owner, type, position } = pieces[from];
  const piecesCopy = pieces.map(x => ({ ...x }));
  const j = pieces.findIndex(x => x.position === to)
  if (j >= 0) {
    piecesCopy[j].position = null;
    piecesCopy[j].owner = owner;
    if (piecesCopy[j].type === 'H') {
      piecesCopy[j].type = 'C';
    }
  }
  piecesCopy[from].position = to
  if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
    piecesCopy[from].type = 'H';
  }
  return piecesCopy
}

function evaluatePosition(pieces: Piece[]) {
  let result = 0;

  //const board: number[] = new Array(12);
  //board.fill(0);
  for (const piece of pieces) {
    result += (piece.owner === 0 ? 1 : -1) * (piece.position === null ? 1 : 2) * pieceValue[piece.type];
    //if (piece.position !== null) {
    //  board[piece.position] = piece.owner + 1;
    //}
  }

  /*
  for (let i = 0; i < 8; i++) {
    const piece = pieces[i];

    if (piece.position !== null) {
      const x = piece.position % 3;
      const y = piece.position / 3 | 0;
      const moves = movesDict[piece.type];
      for (const move of moves) {
        const [dx, dy] = piece.owner === 1 ? [move[0], move[1]] : [-move[0], -move[1]];
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 4) {
          const index = 3 * y2 + x2;
          if (board[index] !== piece.owner + 1) {
            result += piece.owner ? -1 : 1;
          }
        }
      }
    }
  }
  */

  return result;
}

export function alphabeta(depth: number, turn: 0 | 1, alpha: number, beta: number, pieces: Piece[]) {
  const moves = possibleMoves(pieces, turn);

  if (depth === 0) {
    return evaluatePosition(pieces);
  } else if (pieces[1].position === null) {
    return -100000-depth;
  } else if (pieces[5].position === null) {
    return 100000+depth;
  } else if (turn && pieces[5].position > 8) {
    return -100000-depth;
  } else if (!turn && pieces[1].position < 3) {
    return 100000+depth;
  } else {
    const n = moves.length;
    for (let i = 0; i < n; i++) {
      const move = moves[i];
      const newPieces = playMove(pieces, move);
      if (turn === 0) {
        const score = alphabeta(depth - 1, 1, alpha, beta, newPieces);
        if (score > alpha) {
          alpha = score;
        }
      } else {
        const score = alphabeta(depth - 1, 0, alpha, beta, newPieces);
        if (score < beta) {
          beta = score;
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    return turn === 0 ? alpha : beta
  }
}

export function computerMove(played: Piece[][], depth: number, turn: 0 | 1, pieces: Piece[]) {
  let alpha = -Infinity;
  let beta = Infinity;

  const pmoves = possibleMoves(pieces, turn).map(move =>
    [move, playMove(pieces, move)] as [[number, number], Piece[]]
  );
  const [playedTwice, notPlayedTwice] = partition(pmoves,
    ([move, pieces]) => countIf(played, ps => piecesEq(ps, pieces)) >= 1
  );

  let bestMove: [number, number] | null = null;
  for (const [move, newPieces] of notPlayedTwice) {
    if (turn === 0) {
      const score = alphabeta(depth - 1, 1, alpha, beta, newPieces);
      if (score > alpha) {
        alpha = score;
        bestMove = move;
      }
    } else {
      const score = alphabeta(depth - 1, 0, alpha, beta, newPieces);
      if (score < beta) {
        beta = score
        bestMove = move
      }
    }
  }
  if (bestMove) { //&& (if turn then beta <= 0 else alpha >= 0)
    return bestMove;
  }
  
  for (const [move, newPieces] of playedTwice) {
    if (turn === 0) {
      const score = alphabeta(depth - 1, 1, alpha, beta, newPieces)
      if (score > alpha) {
        alpha = score;
        bestMove = move;
      }
    } else {
      const score = alphabeta(depth - 1, 0, alpha, beta, newPieces);
      if (score < beta) {
        beta = score;
        bestMove = move;
      }
    }
  }
  return bestMove!;
}