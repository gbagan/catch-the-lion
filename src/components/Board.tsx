import { batch, Component, createMemo, createSignal, For, Index, Show } from "solid-js";
import { Piece, PieceType, possibleMoves } from "../model";
import range from "lodash.range";

type Position = {x: number, y: number};

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
  lastMove: [number | null, number] | null,
  canPlay: boolean,
  play: (from: number, to: number) => void,
}>

const Board: BoardComponent = props => {
  let svgEl!: SVGSVGElement;
  
  const [selectedPiece, setSelectedPiece] = createSignal<number | null>(null);
  const [lastSelectedPiece, setLastSelectedPiece] = createSignal<number | null>(null);
  const [pointerPosition, setPointerPosition] = createSignal<Position | null>(null);

  const moves = createMemo(() => selectedPiece() !== null ? possibleMoves(props.pieces, props.pieces[selectedPiece()!]) : []);

  const played = (i: number) => props.lastMove && props.lastMove.includes(i);

  function getPointerPosition(e: MouseEvent): Position {
    const { left, top, width, height } = svgEl.getBoundingClientRect();
    return { x: (e.clientX - left) / width, y: (e.clientY - top) / height };
  }

  const ownBothPieces = (i: number, player: 0 | 1) =>
    props.pieces[i].owner === player
    && props.pieces[i+4].owner === player
    && props.pieces[i].position === null
    && props.pieces[i+4].position === null
    && selectedPiece() !== i
    && selectedPiece() !== i + 4

  const pointerDown = (pos: number, e: PointerEvent) => {
    if (!props.canPlay || props.pieces[pos].owner !== props.turn)
      return;
    
    if (e.currentTarget)
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    batch(() => {
      setSelectedPiece(pos);
      setLastSelectedPiece(pos);
      setPointerPosition(getPointerPosition(e));
    });
    setTimeout(() => setLastSelectedPiece(null), 500);
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

  const cancelMove = () => {
    batch(() => {
      setPointerPosition(null);
      setSelectedPiece(null);
    })
  }

  return (
    <div class="w-[42rem] z-20">
      <svg
        viewBox="0 0 1600 1680"
        class="select-none touch-none"
        ref={svgEl}
        onPointerMove={pointerMove}
        onPointerCancel={cancelMove}
        onPointerLeave={cancelMove}
        onPointerUp={cancelMove}
      >
        <symbol id="twice" viewBox="0 0 40 40">
          <rect x="0" y="0" width="40" height="40" fill="red"/>
          <text x="20" y="30" fill="white" font-size="30px" font-weight="bold" text-anchor="middle">2</text>
        </symbol>
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
              fill={played(i()) ? "rgba(0, 255, 0, 0.3)" : "transparent"}
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
              classList={{
                "pointer-events-none": selectedPiece() !== null,
                "transition-transform duration-1000": lastSelectedPiece() !== i,
                "opacity-0": i === selectedPiece() && pointerPosition() !== null
              }}
              onPointerDown={[pointerDown, i]}
            />
          }
        </Index>
        <Index each={[3, 0, 2]}>
          {(i, j) =>
            <>
              <use
                href="#twice"
                width="50"
                height="50"
                classList={{"opacity-0": !ownBothPieces(i(), 0)}}
                style={{
                  transform: `translate(140px, ${1610 - 200 * j}px)`,
                }}
              />
              <use
                href="#twice"
                width="50"
                height="50"
                classList={{"opacity-0": !ownBothPieces(i(), 1)}}
                style={{
                  transform: `translate(1540px, ${240 + 200 * j}px)`,
                }}
              />
            </>
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