import { batch, Component, createMemo, createSignal, For, Index, Show } from "solid-js";
import { Piece, PieceType, possibleMoves } from "../model";
import range from "lodash.range";

type Position = {x: number, y: number};

function getPointerPosition(e: MouseEvent): Position {
  const el = e.currentTarget as Element;
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: (e.clientX - left) / width, y: (e.clientY - top) / height };
}

const rows = [350, 670, 1000, 1320];
const columns = [480, 800, 1120];

const pieceImages: Record<PieceType, string> = {
  L: "./lion.webp",
  G: "./giraffe.webp",
  E: "./elephant.webp",
  C: "./chick.webp",
  H: "./chicken.webp",
}

const pieceIndex: Record<PieceType, number> = {
  C: 0,
  E: 1,
  G: 2,
  L: 3,
  H: 4,
}

const transformPiece = (piece: Piece) => {
  const position = piece.position;
  let x;
  let y;
  let scale;
  if (position === null) {
    x = piece.owner ? 1500 : 100;
    y = piece.owner ? 200 + 200 * pieceIndex[piece.type] : 1570 - 200 * pieceIndex[piece.type];
    scale = 0.7;
  } else {
    x = columns[position % 3];
    y = rows[position / 3 | 0];
    scale = 1;
  }
  const rotate = piece.owner ? '180deg' : '0';
  return `translate(${x}px, ${y}px) rotate(${rotate}) scale(${scale})`;
}

const selectedPieceTransform = (pos: Position, piece: Piece) => {
  const x = 100 * pos.x;
  const y = 100 * pos.y;
  const rotate = piece.owner ? '180deg' : '0';
  return `translate(${x}%, ${y}%) rotate(${rotate})`;
}


type BoardComponent = Component<{
  pieces: Piece[],
  turn: 0 | 1,
  outcome: null | 0 | 1,
  play: (from: number, to: number) => void,
}>

const Board: BoardComponent = props => {
  const [selectedPiece, setSelectedPiece] = createSignal<number | null>(null);
  const [pointerPosition, setPointerPosition] = createSignal<Position | null>(null);

  const moves = createMemo(() => selectedPiece() !== null ? possibleMoves(props.pieces, props.pieces[selectedPiece()!]) : []);

  const pointerDown = (pos: number, e: PointerEvent) => {
    if (props.outcome !== null || props.pieces[pos].owner !== props.turn)
      return;
    
    if (e.currentTarget)
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    setSelectedPiece(pos);
  }

  const pointerMove = (e: PointerEvent) => {
    setPointerPosition(getPointerPosition(e));
  }

  const pointerUp = (to: number) => {
    batch(() => {
      setPointerPosition(null);
      const from = selectedPiece();
      if(from !== null) {
        setSelectedPiece(null);
        props.play(from, to);
      }
    })
  }

  const cancelMove = (e: PointerEvent) => {
    batch(() => {
      setPointerPosition(null);
      setSelectedPiece(null);
    })
  }

  return (
    <div class="w-[42rem] z-20">
      <svg
        viewBox="0 0 1600 1680"
        class="select-none"
        onPointerMove={pointerMove}
        onPointerCancel={cancelMove}
        onPointerLeave={cancelMove}
        onPointerUp={cancelMove}
      >
        <image x="200" y="0" width="1200" height="1680" href="./board.webp" />
        <Index each={range(0, 12)}>
          {i =>
            <rect
              x={320 + 330 * (i() % 3)}
              y={200 + 325 * (i() / 3 | 0)}
              width="298"
              height="298"
              stroke-width="20"
              stroke={moves().includes(i()) ? "lightgreen" : "transparent"}
              classList={{"pointer-events-none": !moves().includes(i()) }}
              fill="transparent"
              onPointerUp={[pointerUp, i()]}
            />
          }
        </Index>

        <Index each={props.pieces}>
          {(piece, i) =>
            <image
              x="-140"
              y="-140"
              width="280"
              height="280"
              style={{transform: transformPiece(piece())}}
              href={pieceImages[piece().type]}
              class="transition-transform duration-1000"
              classList={{"pointer-events-none": selectedPiece() !== null}}
              opacity={i === selectedPiece() ? 0 : 100}
              onPointerDown={[pointerDown, i]}
            />
          }
        </Index>

        {pointerPosition() && selectedPiece() !== null &&
          <image
            x="-140"
            y="-140"
            width="280"
            height="280"
            class="pointer-events-none"
            style={{transform: selectedPieceTransform(pointerPosition()!, props.pieces[selectedPiece()!])}}
            href={pieceImages[props.pieces[selectedPiece()!].type]}
          />

        }
      </svg>
    </div>
  )
}

export default Board;