import { batch, Component, createMemo, createSignal, Index } from "solid-js";
import { movesDict, Piece, PieceType, possibleMoves } from "../model";
import range from "lodash.range";

type Position = { x: number, y: number };

const BOARD_START_X = 320;
const BOARD_START_Y = 200;
const SQUARE_WIDTH = 330;
const SQUARE_HEIGHT = 325; 
const TILE_SIZE = 260;

const PIECE_COLOR: Record<PieceType, string> = {
  L: "#fbc0bf",
  G: "#d6b3d5",
  E: "#d6b3d5",
  C: "#f0f4a3",
  H: "#eef1a5 ",
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
    x = BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (position % 3);
    y = BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (position / 3 | 0);
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

type SuggestionArrowComponent = Component<{
  from: number,
  to: number,
  pieces: Piece[],
}>;

const SuggestionArrow: SuggestionArrowComponent = props => {
  const coords = createMemo(() => {
    const piece = props.pieces[props.from];

    const x2 = BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (props.to % 3);
    const y2 = BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (props.to / 3 | 0);
    if (piece.position === null) {

      return {
        x1: "100",
        y1: 1570 - 200 * pieceIndex[piece.type],
        x2,
        y2
      }
    } else {
      return {
        x1: BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (piece.position % 3),
        y1: BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (piece.position / 3 | 0),
        x2,
        y2,
      }
    }
  });

  return (
    <line
      x1={coords().x1}
      x2={coords().x2}
      y1={coords().y1}
      y2={coords().y2}
      stroke="red"
      stroke-width="50"
      class="pointer-events-none animate-lion-arrow"
      marker-end="url(#arrowhead)"
    />
  )
}

type BoardComponent = Component<{
  pieces: Piece[],
  turn: 0 | 1,
  lastMove: [number | null, number] | null,
  canPlay: boolean,
  wantedMove: [number, number] | null
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
    && props.pieces[i + 4].owner === player
    && props.pieces[i].position === null
    && props.pieces[i + 4].position === null
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
  }

  const pointerMove = (e: PointerEvent) => {
    setPointerPosition(getPointerPosition(e));
  }

  const pointerUp = (to: number) => {
    batch(() => {
      setPointerPosition(null);
      const from = selectedPiece();
      if (from !== null) {
        setSelectedPiece(null);
        props.play(from, to);
      }
    })
    setTimeout(() => setLastSelectedPiece(null), 500);
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
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 4 2, 0 4" fill="red" />
          </marker>
        </defs>
        <symbol id="twice" viewBox="0 0 40 40">
          <rect x="0" y="0" width="40" height="40" fill="red" />
          <text x="20" y="30" fill="white" font-size="30px" font-weight="bold" text-anchor="middle">2</text>
        </symbol>
        {['L', 'G', 'E', 'C', 'H'].map(i =>
          <symbol id={`piece-${i}`} viewBox="0 0 50 50">
            <rect x="0.5" y="0.5" width="49" height="49" rx="5" ry="5" fill={PIECE_COLOR[i as PieceType]} stroke="black" stroke-width="1" />
            <image x="6" y="6" width="38" height="38" href={`./piece-${i}.webp`} />
            {movesDict[i as PieceType].map(([dx, dy]) =>
              <circle
                cx={25 + 20 * dx}
                cy={25 - 20 * dy}
                r="2"
                stroke="black"
                fill="red"
              />
            )}
          </symbol>
        )}
        <image x="200" y="-500" width="1200" height="2580" href="./board4.webp" preserveAspectRatio="xMidYMid"/>
        {[0, 1, 2, 3, 4].map(i =>
          <line
            x1={BOARD_START_X}
            y1={BOARD_START_Y + i * SQUARE_HEIGHT}
            x2={BOARD_START_X + 3 * SQUARE_WIDTH}
            y2={BOARD_START_Y + i * SQUARE_HEIGHT}
            stroke="red"
            stroke-width="5"
            stroke-dasharray={`${SQUARE_WIDTH / 8} ${SQUARE_WIDTH / 8}`}
            stroke-dashoffset={SQUARE_WIDTH / 16}
          />
        )}
        {[0, 1, 2, 3].map(i =>
          <line
            x1={BOARD_START_X + i * SQUARE_WIDTH}
            y1={BOARD_START_Y}
            x2={BOARD_START_X + i * SQUARE_WIDTH}
            y2={BOARD_START_Y + 4 * SQUARE_HEIGHT}
            stroke="red"
            stroke-width="5"
            stroke-dasharray={`${SQUARE_HEIGHT / 8} ${SQUARE_HEIGHT / 8}`}
            stroke-dashoffset={SQUARE_HEIGHT / 16}
          />
        )}
        <Index each={range(0, 12)}>
          {i =>
            <rect
              x={BOARD_START_X + 10 + SQUARE_WIDTH * (i() % 3)}
              y={BOARD_START_Y + 10 + SQUARE_HEIGHT * (i() / 3 | 0)}
              width={SQUARE_WIDTH-20}
              height={SQUARE_HEIGHT-20}
              stroke-width="20"
              stroke={moves().includes(i()) ? "lightgreen" : "transparent"}
              classList={{ "pointer-events-none": !moves().includes(i()) }}
              fill={played(i()) ? "rgba(0, 255, 0, 0.3)" : "transparent"}
              onPointerUp={[pointerUp, i()]}
            />
          }
        </Index>

        <Index each={props.pieces}>
          {(piece, i) =>
            <use
              x={-TILE_SIZE / 2}
              y={-TILE_SIZE / 2}
              width={TILE_SIZE}
              height={TILE_SIZE}
              style={{ transform: transformPiece(piece()) }}
              href={`#piece-${piece().type}`}
              classList={{
                "pointer-events-none": selectedPiece() !== null,
                "transition-transform duration-1000": lastSelectedPiece() !== i,
                "opacity-0": i === selectedPiece() && pointerPosition() !== null
              }}
              onPointerDown={[pointerDown, i]}
              filter="drop-shadow(16px 16px 16px gray)"
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
                classList={{ "opacity-0": !ownBothPieces(i(), 0) }}
                style={{
                  transform: `translate(140px, ${1610 - 200 * j}px)`,
                }}
              />
              <use
                href="#twice"
                width="50"
                height="50"
                classList={{ "opacity-0": !ownBothPieces(i(), 1) }}
                style={{
                  transform: `translate(1540px, ${240 + 200 * j}px)`,
                }}
              />
            </>
          }
        </Index>

        {pointerPosition() && selectedPiece() !== null &&
          <use
            x={-TILE_SIZE / 2}
            y={-TILE_SIZE / 2}
            width={TILE_SIZE}
            height={TILE_SIZE}
            class="pointer-events-none"
            style={{ transform: selectedPieceTransform(pointerPosition()!, props.pieces[selectedPiece()!]) }}
            href={`#piece-${props.pieces[selectedPiece()!].type}`}
          />
        }
        {props.wantedMove && selectedPiece() === null &&
          <SuggestionArrow
            from={props.wantedMove[0]}
            to={props.wantedMove[1]}
            pieces={props.pieces}
          />
        }
      </svg>
    </div>
  )
}

export default Board;