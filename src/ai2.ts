import { movesDict, Piece, PieceType } from "./model";

const pieceValue: Record<PieceType, number> = {
  L: 1000,
  H: 7,
  G: 5,
  E: 3,
  C: 1,
}

/*
const mobilityWeight: Record<PieceType, number> = {
  L: 0.5,
  H: 0.1,
  G: 0.2,
  E: 0.3,
  C: 0.4,
}
*/

function possibleMoves(pieces: Piece[], turn: 0 | 1): [number, number][] {
  const result: [number, number][] = [];
  const board = new Array(12);
  board.fill(0);
  for (const piece2 of pieces) {
    if (piece2.position !== null) {
      board[piece2.position] = piece2.owner + 1;
    }
  }

  for (let i = 0; i < 8; i++) {
    const piece = pieces[i];
    if (piece.owner !== turn)
      continue;

    if (piece.position === null) {
      if (i < 4 || pieces[i - 4].owner !== piece.owner || pieces[i - 4].position !== null) {
        for (let j = 0; j < 12; j++) {
          if (!board[j]) {
            result.push([i, j]);
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
          let index = 3 * y2 + x2;
          if (board[index] !== piece.owner + 1) {
            result.push([i, index]);
          }
        }
      }
    }
  }
  return result;
}

function playMove(pieces: Piece[], [from, to]: [number, number]): Piece[] {
  const { owner, type, position } = pieces[from];
  const piecesCopy = pieces.map(piece => ({ ...piece }));
  let j = pieces.findIndex(piece => piece.position === to);
  if (j >= 0) {
    piecesCopy[j].position = null;
    piecesCopy[j].owner = owner;
    if (piecesCopy[j].type === 'H') {
      piecesCopy[j].type = 'C'
    }
  }
  piecesCopy[from].position = to;
  if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
    piecesCopy[from].type = 'H';
  }
  return piecesCopy;
}

function evaluatePosition(pieces: Piece[]): number {
  let result = 0;

  const board = new Array(12);
  board.fill(0);
  for (const piece of pieces) {
    result += (piece.owner ? -1 : 1) * pieceValue[piece.type];
    if (piece.position !== null) {
      board[piece.position] = piece.owner + 1;
    }
  }

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
          let index = 3 * y2 + x2;
          if (board[index] !== piece.owner + 1) {
            result += 0.1 * (piece.owner ? -1 : 1) // mobilityWeight[piece.type];
          }
        }
      }
    }
  }
  return result;
}

export function alphabeta(depth: number, turn: 0 | 1, alpha: number, beta: number, pieces: Piece[]): [number, [number, number]] {
  const moves = possibleMoves(pieces, turn);
  let score!: number;
  let bestMove!: [number, number];

  if (depth === 0) {
    score = evaluatePosition(pieces);
    return [score, bestMove];
  } else if (pieces[1].position === null) {
    return [-100000-depth, bestMove];
  } else if (pieces[5].position === null) {
    return [100000+depth, bestMove];
  } else if (turn && pieces[5].position > 8) {
    return [-100000-depth, bestMove];
  } else if (turn && pieces[1].position < 3) {
    return [100000+depth, bestMove];
  } else {
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      var newPieces = playMove(pieces, move);
      if (turn === 0) {
        score = alphabeta(depth - 1, 1, alpha, beta, newPieces)[0];
        if (score > alpha) {
          alpha = score;
          bestMove = move;
        }
      }
      else {
        score = alphabeta(depth - 1, 0, alpha, beta, newPieces)[0];
        if (score < beta) {
          beta = score;
          bestMove = move;
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    return turn === 0 ? [alpha, bestMove] : [beta, bestMove];
  }
}