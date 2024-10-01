export type PieceType = 'L' | 'G' | 'c' | 'E' | 'C';
type Position = number | null;
type Owner = 0 | 1;

export type Piece = {
  type: PieceType,
  position: Position,
  owner: Owner,
}

export type State = {
  pieces: Piece[],
  turn: 0 | 1,
  outcome: 0 | 1 | null,
}

export const initPieces: () => Piece[] = () => [
  { type: 'E', position: 9, owner: 0 },
  { type: 'L', position: 10, owner: 0 },
  { type: 'G', position: 11, owner: 0 },
  { type: 'c', position: 7, owner: 0 },
  { type: 'E', position: 2, owner: 1 },
  { type: 'L', position: 1, owner: 1 },
  { type: 'G', position: 0, owner: 1 },
  { type: 'c', position: 4, owner: 1 },
]

export const initState: () => State = () => ({
  pieces: initPieces(),
  turn: 0,
  outcome: null,
})


export const movesDict: Record<PieceType, [number, number][]> = {
  c: [[0, 1]],
  C: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1]],
  G: [[0, 1], [1, 0], [0, -1], [-1, 0]],
  E: [[1, 1], [-1, 1], [1, -1], [-1, -1]],
  L: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
}

export function possibleMoves(pieces: Piece[], piece: Piece): number[] {
  const board = new Array(12);
  board.fill(0);
  for (const piece2 of pieces) {
    if(piece2.position !== null) {
      board[piece2.position] = piece2.owner + 1;
    }
  }
  

  if (piece.position === null) {
    const res = [];
    for (let i = 0; i < 12; i++) {
      if(!board[i]) {
        res.push(i);
      }
    }
    return res;
  }
  
  const res = [];
  const x = piece.position % 3;
  const y = piece.position / 3 | 0;
  const moves = movesDict[piece.type];
  for (const move of moves) {
    const [dx, dy] = piece.owner ? [move[0], move[1]] : [-move[0], -move[1]];
    const x2 = x + dx;
    const y2 = y + dy;
    if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 4) {
      let index = 3 * y2 + x2;
      if(board[index] !== piece.owner + 1) {
        res.push(index);
      }
    }
  }
  return res;
}