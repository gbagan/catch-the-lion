<script lang="ts">
  import { BOARD_START_X, BOARD_START_Y, PIECE_COLOR, PIECE_INDEX, SQUARE_HEIGHT, SQUARE_WIDTH, TILE_SIZE } from "../constants";
  import { movesDict, type Piece, type PieceType, possibleMoves } from "../model";
  import SuggestionArrow from "./SuggestionArrow.svelte";

  type Position = { x: number, y: number }

  type Props = {
    pieces: Piece[],
    turn: 0 | 1,
    lastMove: [number | null, number] | null,
    canPlay: boolean,
    requiredMove: [number, number] | null,
    play: (from: number, to: number) => void,
  }

  let { pieces, turn, lastMove, canPlay, requiredMove, play }: Props = $props();

  let selectedPiece: number | null = $state(null);
  let lastSelectedPiece: number | null = $state(null);
  let pointerPosition: Position | null = $state(null);
  let svgEl: SVGSVGElement = $state()!;

  let moves = $derived(
    selectedPiece !== null
    ? possibleMoves(pieces, pieces[selectedPiece])
    : []
  );

  const transformPiece = (piece: Piece) => {
    const position = piece.position;
    let x;
    let y;
    let scale;
    if (position === null) {
      x = piece.owner ? 1500 : 100;
      y = piece.owner ? 200 + 200 * PIECE_INDEX[piece.type] : 1570 - 200 * PIECE_INDEX[piece.type];
      scale = 0.7;
    } else {
      x = BOARD_START_X + SQUARE_WIDTH / 2 + SQUARE_WIDTH * (position % 3);
      y = BOARD_START_Y + SQUARE_HEIGHT / 2 + SQUARE_HEIGHT * (position / 3 | 0);
      scale = 1;
    }
    const rotate = piece.owner ? '180deg' : '0';
    return `translate(${x}px, ${y}px) rotate(${rotate}) scale(${scale})`
  }

  const selectedPieceTransform = (pos: Position, piece: Piece) => {
    const x = 100 * pos.x;
    const y = 100 * pos.y;
    const rotate = piece.owner ? '180deg' : '0';
    return `translate(${x}%, ${y}%) rotate(${rotate})`
  }

  const played = (i: number) => lastMove && lastMove.includes(i);

  const getPointerPosition = (e: MouseEvent): Position => {
    const { left, top, width, height } = svgEl.getBoundingClientRect();
    return { x: (e.clientX - left) / width, y: (e.clientY - top) / height }
  }

  const ownBothPieces = (i: number, player: 0 | 1) =>
    pieces[i].owner === player
    && pieces[i + 4].owner === player
    && pieces[i].position === null
    && pieces[i + 4].position === null
    && selectedPiece !== i
    && selectedPiece !== i + 4;

  const handlePointerDown = (pos: number, e: PointerEvent) => {
    if (!canPlay || pieces[pos].owner !== turn) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    selectedPiece = pos;
    lastSelectedPiece = pos;
    pointerPosition = getPointerPosition(e);
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (selectedPiece === null) return;
    pointerPosition = getPointerPosition(e);
  }

  const handlePointerUp = (to: number, e: PointerEvent) => {
    e.stopPropagation();
    const from = selectedPiece;
    pointerPosition = null;
    if (from !== null) {
      selectedPiece = null;
      play(from, to);
    }
    setTimeout(() => lastSelectedPiece = null, 500);
  }

  const cancelMove = () => {
    selectedPiece = null;
    pointerPosition = null;
  }
</script>

<div class="container">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    viewBox="0 0 1600 1680"
    bind:this={svgEl}
    onpointermove={handlePointerMove}
    onpointercancel={cancelMove}
    onpointerleave={cancelMove}
    onpointerup={cancelMove}
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
    {#each ['L', 'G', 'E', 'C', 'H'] as i}
      <symbol id="piece-{i}" viewBox="0 0 50 50">
        <rect
          x="0.5"
          y="0.5"
          width="49"
          height="49"
          rx="5"
          ry="5"
          fill={PIECE_COLOR[i as PieceType]}
          stroke="black"
          stroke-width="1"
        />
        <image x="6" y="6" width="38" height="38" href="./piece-{i}.webp" />
        {#each movesDict[i as PieceType] as [dx, dy]}
          <circle
            cx={25 + 20 * dx}
            cy={25 - 20 * dy}
            r="2"
            stroke="black"
            fill="red"
          />
        {/each}
      </symbol>
    {/each}
    <image x="200" y="-500" width="1200" height="2580" href="./board4.webp" preserveAspectRatio="xMidYMid"/>
    {#each [0, 1, 2, 3, 4] as i}
      <line
        x1={BOARD_START_X}
        y1={BOARD_START_Y + i * SQUARE_HEIGHT}
        x2={BOARD_START_X + 3 * SQUARE_WIDTH}
        y2={BOARD_START_Y + i * SQUARE_HEIGHT}
        stroke="red"
        stroke-width="5"
        stroke-dasharray="{SQUARE_WIDTH / 8} {SQUARE_WIDTH / 8}"
        stroke-dashoffset={SQUARE_WIDTH / 16}
      />
    {/each}
    {#each [0, 1, 2, 3] as i}
      <line
        x1={BOARD_START_X + i * SQUARE_WIDTH}
        y1={BOARD_START_Y}
        x2={BOARD_START_X + i * SQUARE_WIDTH}
        y2={BOARD_START_Y + 4 * SQUARE_HEIGHT}
        stroke="red"
        stroke-width="5"
        stroke-dasharray="{SQUARE_HEIGHT / 8} {SQUARE_HEIGHT / 8}"
        stroke-dashoffset={SQUARE_HEIGHT/16}
      />
    {/each}
    {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as i}
      <rect
        x={BOARD_START_X + 10 + SQUARE_WIDTH * (i % 3)}
        y={BOARD_START_Y + 10 + SQUARE_HEIGHT * (i / 3 | 0)}
        width={SQUARE_WIDTH-20}
        height={SQUARE_HEIGHT-20}
        stroke-width="20"
        stroke={moves.includes(i) ? "lightgreen" : "transparent"}
        pointer-events={moves.includes(i) ? "" : "none"}
        fill={played(i) ? "rgba(0, 255, 0, 0.3)" : "transparent"}
        onpointerup={e => handlePointerUp(i, e)}
      />
    {/each}
      
    {#each pieces as piece, i}
      <use
        x={-TILE_SIZE/2}
        y={-TILE_SIZE/2}
        width={TILE_SIZE}
        height={TILE_SIZE}
        style:transform={transformPiece(piece)}
        href="#piece-{piece.type}"
        pointer-events={selectedPiece === null ? "" : "none"}
        opacity={i === selectedPiece ? 0 : 1}
        class={{animate: lastSelectedPiece !== i}}
        onpointerdown={e => handlePointerDown(i, e)}
        filter="drop-shadow(16px 16px 16px gray)"
      />
    {/each}
    {#each [3, 0, 2] as i, j}
      <use
        href="#twice"
        width="50"
        height="50"
        opacity={ownBothPieces(i, 0) ? 1 : 0}
        style:transform="translate(140px, {1610 - 200 * j}px)"
      />
      <use
        href="#twice"
        width="50"
        height="50"
        opacity={ownBothPieces(i, 1) ? 1 : 0}
        style:transform="translate(1540px, {240 + 200 * j}px)"
      />
    {/each}
    {#if pointerPosition && selectedPiece !== null}
      <use
        x={-TILE_SIZE/2}
        y={-TILE_SIZE/2}
        width={TILE_SIZE}
        height={TILE_SIZE}
        pointer-events="none"
        style:transform={selectedPieceTransform(pointerPosition, pieces[selectedPiece])}
        href="#piece-{pieces[selectedPiece].type}"
      />
    {/if}
    {#if requiredMove && selectedPiece === null}
      <SuggestionArrow
        from={requiredMove[0]}
        to={requiredMove[1]}
        pieces={pieces}
      />
    {/if}
  </svg>
</div>

<style>
  svg {
    user-select: none;
    touch-action: none;
  }

  .container {
    width: 42rem;
    z-index: 20;
  }

  .animate {
    transition: transform 600ms linear;
  }
</style>