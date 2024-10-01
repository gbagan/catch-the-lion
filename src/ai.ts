import maxBy from "lodash.maxby";
import { movesDict, Piece, PieceType } from "./model";
import { sample } from "./util";
import minBy from "lodash.minby";

const pieceValue: Record<PieceType, number> = {
  L: 1000,
  H: 4,
  G: 3,
  E: 2,
  C: 1,
}

/*
function possibleMoves(pieces: Piece[], turn: 0 | 1): [number, number][] {
  const res: [number, number][] = [];
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
      const res = [];
      for (let j = 0; j < 12; j++) {
        if (!board[j]) {
          res.push([i, j]);
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
            res.push([i, index]);
          }
        }
      }
    }
  }
  return res;
}
*/

export function level1AI(pieces: Piece[], turn: 0 | 1): [number, number] {
  const kingMoves: number[] = [];
  const possibleMoves: [number, number][] = [];
  const board = new Array(12);
  board.fill(0);
  const board2: (Piece | null)[] = new Array(12);
  board2.fill(null);
  for (const piece2 of pieces) {
    if (piece2.position !== null) {
      board[piece2.position] = piece2.owner + 1;
      board2[piece2.position] = piece2;
    }
  }

  // pieces of the current player that control the case i
  const attacks: number[][] = new Array(12);
  // pieces of the adversary that control the case i
  const advAttacks: number[][] = new Array(12);
  for (let i = 0; i < 12; i++) {
    attacks[i] = []
    advAttacks[i] = [];
  }

  for (let i = 0; i < 8; i++) {
    const piece = pieces[i];
    if (piece.owner === turn) {
      if (piece.position === null) {
        for (let j = 0; j < 12; j++) {
          if (!board[j]) {
            possibleMoves.push([i, j]);
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
            attacks[index].push(i);
            if (board[index] !== piece.owner + 1) {
              if (i === 1 || i === 5) {
                kingMoves.push(index);
              }
              possibleMoves.push([i, index]);
            }
          }
        }
      }
    } else if (piece.position !== null) {
      const x = piece.position % 3;
      const y = piece.position / 3 | 0;
      const moves = movesDict[piece.type];
      for (const move of moves) {
        const [dx, dy] = !turn ? [move[0], move[1]] : [-move[0], -move[1]];
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 4) {
          advAttacks[3 * y2 + x2].push(i);
        }
      }
    }
  }

  const exchanges: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const piece = board2[i];
    if (!piece || piece.owner === turn)
      continue;
    const value = pieceValue[piece.type];
    let attackers = attacks[i];
    if (attackers.length === 0)
      continue;
    if (advAttacks[i].length === 0) {
      exchanges.push([i, value]);
    } else {
      const minAttackerValue = Math.min(...attackers.map(j => pieceValue[pieces[j].type]));
      if (value >= minAttackerValue) {
        exchanges.push([i, value - minAttackerValue]);
      }
    }
  }


  // if the machine can catch the lion
  const advLionPosition = turn ? pieces[1].position! : pieces[5].position!;
  const attackLion = attacks[advLionPosition];
  if (attackLion.length > 0) {
    return [attackLion[0], turn ? pieces[1].position! : pieces[5].position!]
  }

  // if the machine lion is attacked
  const advAttackLion = turn ? advAttacks[1] : advAttacks[5];
  if (advAttackLion.length > 0) {
    const attacker = advAttackLion[0];
    const attackerPosition = pieces[attacker].position!;
    const defenders = attacks[attackerPosition];
    const exchange = exchanges.find(e => e[0] === attackerPosition);
    if (exchange) {
      console.log("protect the lion");
      const minDefender = minBy(attacks[exchange[0]], i => pieceValue[pieces[i].type])!;
      return [minDefender, attackerPosition];
    } else {
      const safeMoves = kingMoves.filter(i => advAttacks[i].length === 0);
      if (safeMoves.length > 0) {
        console.log("move the lion");
        const lion = turn ? 5 : 1;
        return [lion, sample(safeMoves)!];
      } else if (defenders.length > 0) {
        console.log("protect the lion with a unfavourable move");
        const minDefender = minBy(defenders, i => pieceValue[pieces[i].type])!;
        return [minDefender, attackerPosition];
      }
      console.log("don't protect the lion");
      return sample(possibleMoves)!;
    }
  }


  // find the best exchange
  if (exchanges.length > 0) {
    const bestExchange = maxBy(exchanges, e => e[1])![0];
    const minAttacker = minBy(attacks[bestExchange], i => pieceValue[pieces[i].type])!;
    console.log(exchanges, bestExchange, minAttacker);
    return [minAttacker, bestExchange];
  }

  const reallySafePossibleMoves = possibleMoves.filter(([from, to]) => {
    const value = pieceValue[pieces[from].type]!;
    const advAttackers = advAttacks[to];
    if (advAttackers.length === 0)
      return true;
    const minAttacker = minBy(advAttackers, i => pieceValue[pieces[i].type])!;
    const defenders = attacks[to];
    if (defenders.length === 0) {
      return false;
    }
    return value <= minAttacker && advAttackers.length <= 1;
  });
  if (reallySafePossibleMoves.length > 0) {
    console.log("really safe");
    return sample(reallySafePossibleMoves)!;
  }


  const safePossibleMoves = possibleMoves.filter(([from, to]) =>
    (from !== 1 && from !== 5) || advAttacks[to].length === 0
  )
  if (safePossibleMoves.length > 0) {
    console.log("safe");
    return sample(safePossibleMoves)!;
  }

  return sample(possibleMoves)!;
}