<script lang="ts">
  import { condition2Win, type Config, type Played, drawGame, initPieces, newConfig } from './model';
  import { delay } from './util';
  import { tutorial } from './tutorial';
  import Worker from './worker?worker';
  import Board from './components/Board.svelte';
  import Info from './components/Info.svelte';
  import NewGame from './components/NewGame.svelte';
  import Rules from './components/Rules.svelte';
  import Credits from './components/Credits.svelte';
  import Button from './components/Button.svelte';

  let pieces =  $state(initPieces());
  let turn: 0 | 1 = $state(0);
  let outcome: 0 | 1 | 2 | null = $state(null);
  let played: Played = $state([]);
  let config = $state(newConfig());
  let isThinking = $state(false);
  let dialog: "newgame" | "rules" | "credits" | null = $state(null);
  let tutorialStep: number | null = $state(null);

  let dialogEl: HTMLDialogElement = $state()!;
  let moveAudio: HTMLAudioElement = $state()!;
  let captureAudio: HTMLAudioElement = $state()!;

  const requiredMove = $derived.by(() => {
    if (tutorialStep === null) {
      return null
    }
    const action = tutorial[tutorialStep].action;
    return action.type === "playerAction" ? [action.from, action.to] as [number, number] : null
  });

  const worker = new Worker();

  const workerTask = (data: any): Promise<[number, number]> =>
    new Promise(resolve => {
      worker.onmessage = e => resolve(e.data);
      worker.postMessage(data)
    });

  function playAux(from: number, to: number) {
    const { owner, type, position } = pieces[from];
    const fromPos = pieces[from].position;
    const piecesCopy = pieces.map(x => ({ ...x}));
    played.push({ pieces: piecesCopy, move: [fromPos, to] });
    const j = pieces.findIndex(x => x.position === to);
    if (j == -1) {
      moveAudio.play();
    } else {
      captureAudio.play();
      pieces[j].position = null;
      pieces[j].owner = owner;
      if (pieces[j].type === "H") {
        pieces[j].type = "C";
      } 
      if (pieces[j].type === 'L') {
        outcome = owner;
      }
    }
    pieces[from].position = to;
    if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
      pieces[from].type = 'H';
    }
    if (condition2Win(pieces, turn)) {
      outcome = turn;
    }
    if (drawGame(pieces, played)) { 
      outcome = 2;
    }
    turn = turn === 0 ? 1 : 0;
  }

  async function machinePlays() {
    const data = {
      pieces: pieces.map(x => ({ ...x })),
      turn: turn,
      adversary: config.adversary,
      played: played.map(x => x.pieces.map(y => ({ ...y })))
    };
    const [[from2, to2]] = await Promise.all([workerTask(data), delay(1500)]);
    isThinking = false;
    playAux(from2, to2);
  }

  async function play(from: number, to: number) {
    if (config.adversary === 'human') {
      playAux(from, to)
    } else {
      playAux(from, to)
      if (outcome === null) {
        isThinking = true;
        await machinePlays();
      }
    }
  }
      
  function undo() {
    if (isThinking) {
      return
    }

    if (played.length > 1 || played.length === 1 && config.adversary === 'human') {
      pieces = played.pop()!.pieces;
      turn = turn === 0 ? 1 : 0
      outcome = null
    }
    const parity = played.length % 2 === 0;

    if (config.adversary !== 'human' && parity === config.machineStarts) {
      pieces = played.pop()!.pieces;
      turn = turn === 0 ? 1 : 0
    }
  }

  function openNewGameDialog() {
    if (isThinking) {
      return;
    }
    dialog = "newgame";
    dialogEl.showModal();
  }

  function openRulesDialog() {
    dialog = "rules";
    dialogEl.showModal()
  }

  function openCreditsDialog() {
    dialog = "credits";
    dialogEl.showModal();
  }

  function closeDialog() {
    dialogEl.close();
    dialog = null;
  }

  function newGame(config2: Config) {
    config = { ...config2 };
    pieces = initPieces();
    played = [];
    outcome = null;
    turn = config.machineStarts ? 1 : 0;
    isThinking = config.machineStarts;
    dialog = null;
    tutorialStep = null;
    dialogEl.close();
    if (config.machineStarts && config.adversary !== "human") {
      machinePlays()
    }
  }

  function startTutorial() {
    if (isThinking) {
      return
    }
    pieces = initPieces();
    played = [];
    outcome = null;
    turn = 0;
    isThinking = false;
    dialog = null;
    tutorialStep = 0;
  }

  function tutorialPred() {
   if (tutorialStep === null) {
      return
    }
    tutorialStep = Math.max(0, tutorialStep - 1);
    if (tutorial[tutorialStep!].action.type !== 'read') {
      pieces = played.pop()!.pieces;
      turn = turn === 1 ? 0 : 1;
    }
  }

  function tutorialNext() {
    if (tutorialStep === null) {
      return
    }
    const action = tutorial[tutorialStep].action;
    if (action.type === 'playerAction') {
      return
    }
    if (action.type === 'machineAction') {
      playAux(action.from, action.to);
    }
    tutorialStep = Math.min(tutorial.length - 1, tutorialStep + 1);
  }


  function tutorialPlay(from: number, to: number) {
    if (tutorialStep === null) {
      return
    }
    const required = tutorial[tutorialStep].action;
    if (required.type !== 'playerAction' || from !== required.from || to !== required.to) {
      return
    }
    playAux(from, to);
    tutorialStep = Math.min(tutorial.length - 1, tutorialStep + 1);
  }
</script>

<audio src="./move.webm" preload="auto" bind:this={moveAudio}></audio>
<audio src="./capture.webm" preload="auto" bind:this={captureAudio}></audio>
<div class="wrap">
  <div class="lighter"></div>
  <div class="board">
    <div class="title">Catch the lion</div>
    <Button onclick={openNewGameDialog}>Nouvelle partie</Button>
    <Button onclick={undo}>Annuler</Button>
    <Button onclick={startTutorial}>Tutoriel</Button>
    <Button onclick={openRulesDialog}>Règles</Button>
    <Button onclick={openCreditsDialog}>Crédits</Button>
  </div>
  {#if tutorialStep === null}
    <Board
      pieces={pieces}
      turn={turn}
      lastMove={played.at(-1)?.move ?? null}
      canPlay={!isThinking && outcome === null}
      requiredMove={null}
      play={play}
    />
  {:else}
    <Board
      pieces={pieces}
      turn={turn}
      lastMove={played.at(-1)?.move ?? null}
      canPlay={tutorial[tutorialStep].action.type === 'playerAction'}
      requiredMove={requiredMove}
      play={tutorialPlay}
    />
  {/if}
  <Info
    outcome={outcome}
    isThinking={isThinking}
    adversary={config.adversary}
    tutorialStep={tutorialStep}
    tutorialNext={tutorialNext}
    tutorialPred={tutorialPred}
  />
</div>
<dialog bind:this={dialogEl}>
  {#if dialog === "newgame"}
    <NewGame
      config={config}
      closeDialog={closeDialog}
      newGame={newGame}
    />
  {:else if dialog === "rules"}
    <Rules closeDialog={closeDialog} />
  {:else if dialog === "credits"}
    <Credits closeDialog={closeDialog} />
  {/if}
</dialog>

<style>
  .wrap {
    position: relative;

    width: 100vw;
    min-height: 100vh;

    background-image: var(--bg-main);
    background-size: cover;
    background-repeat: no-repeat;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }

  @media (orientation: portrait) {
    .wrap {
      flex-direction: column;
    }
  }

  .lighter {
    position: absolute;
    background-color: #ffffff;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    z-index: 10;
    pointer-events: none;
  }

  .board {
    display: flex;
    flex-direction: column;

    background-image: var(--bg-board);

    padding: 1.5rem;

    border-width: 2px; 
    border-style: solid;
    border-color: black;
    border-radius: 1rem;

    gap: 1rem;
    z-index: 20;
  }

  .title {
    font-size: 2.25rem;    /* text-4xl = 36px */
    line-height: 2.5rem;   /* line-height par défaut pour text-4xl */
  }

  dialog {
    display: block;
    border: none;
    background-image: var(--bg-board);
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 
                0 1px 2px -1px rgb(0 0 0 / 0.1);

    &::backdrop {
      background-color: rgba(107, 114, 128, 0.7);
    }
    
    &:not([open]) {
      pointer-events: none;
      opacity: 0;
    }

    &[open] {
      animation: flip-y 1s both;
    }
  }

  @keyframes flip-y {
    0% { 
      opacity: 0;
      transform: rotateY(180deg);
    }
    100% { 
      opacity: 1;
      transform: rotateY(0);
    }
  }
</style>