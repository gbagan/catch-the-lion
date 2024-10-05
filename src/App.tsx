import { batch, Component } from 'solid-js';
import { createStore, produce } from "solid-js/store";
import Board from './components/Board';
import Info from './components/Info';
import { condition2Win, Config, drawGame, initPieces, initState } from './model';
import NewGame from './components/NewGame';
import { delay, last } from './util';
import Worker from './worker?worker';
import { tutorial } from './tutorial';
import Rules from './components/Rules';
import Credits from './components/Credits';

const App: Component = () => {
  let dialog!: HTMLDialogElement;
  let moveAudio!: HTMLAudioElement;
  let captureAudio!: HTMLAudioElement;

  const [state, setState] = createStore(initState());

  const wantedMove = () => {
    if (state.tutorialStep === null)
      return null;
    const action = tutorial[state.tutorialStep].action;
    return action.type === "playerAction" ? [action.from, action.to] as [number, number] : null;
  }

  const worker = new Worker();

  function workerTask(data: any): Promise<[number, number]> {
    return new Promise(resolve => {
      worker.onmessage = function (e) {
        resolve(e.data);
      };
      worker.postMessage(data);
    });
  }

  const playAux = (from: number, to: number) => {
    const { owner, type, position } = state.pieces[from];
    const fromPos = state.pieces[from].position;
    batch(() => {
      const piecesCopy = state.pieces.map(piece => ({ ...piece }));
      setState("played", state.played.length, { pieces: piecesCopy, move: [fromPos, to] });
      let j = state.pieces.findIndex(piece => piece.position === to);
      if (j >= 0) {
        captureAudio.play();
        setState("pieces", j, { position: null, owner });
        setState("pieces", j, "type", type => type === 'H' ? 'C' : type);
        if (state.pieces[j].type === 'L') {
          setState("outcome", owner);
        }
      } else {
        moveAudio.play();
      }
      setState("pieces", from, "position", to);
      if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
        setState("pieces", from, "type", 'H');
      }
      if (condition2Win(state.pieces, state.turn)) {
        setState("outcome", state.turn);
      }
      if (drawGame(state.pieces, state.played)) {
        setState("outcome", 2);
      }
      setState("turn", turn => turn === 0 ? 1 : 0);
    });
  }

  const machinePlays = async () => {
    const data = {
      pieces: state.pieces.map(p => ({ ...p })),
      turn: state.turn,
      adversary: state.config.adversary
    };
    const [[from2, to2]] = await Promise.all([workerTask(data), delay(1500)]);
    batch(() => {
      setState("isThinking", false);
      playAux(from2, to2);
    })
  }

  const play = async (from: number, to: number) => {
    if (state.config.adversary === 'human') {
      playAux(from, to);
    } else {
      batch(() => {
        playAux(from, to);
        if (state.outcome === null) {
          setState("isThinking", true);
        }
      });
      if (state.outcome !== null)
        return
      await machinePlays();
    }
  }

  const undo = () => {
    if (state.isThinking)
      return

    setState(produce(state => {
      if (state.played.length > 1) {
        const pieces = state.played.pop()!.pieces;
        state.pieces = pieces;
        state.turn = state.turn === 0 ? 1 : 0;
        state.outcome = null;
      }
      const parity = state.played.length % 2 === 0;

      if (state.config.adversary !== 'human' && parity === state.config.machineStarts) {
        const pieces = state.played.pop()!.pieces;
        state.pieces = pieces;
        state.turn = state.turn === 0 ? 1 : 0;
      }
    }));
  }

  const openNewGameDialog = () => {
    setState("dialog", "newgame");
    dialog.showModal();
  }

  const openRulesDialog = () => {
    setState("dialog", "rules");
    dialog.showModal();
  }

  const openCreditsDialog = () => {
    setState("dialog", "credits");
    dialog.showModal();
  }


  const closeDialog = () => {
    dialog.close();
    setState("dialog", null);
  }

  const newGame = (config: Config) => {
    setState(produce(state => {
      state.config = { ...config };
      state.pieces = initPieces();
      state.played = [];
      state.outcome = null;
      state.turn = state.config.machineStarts ? 1 : 0;
      state.isThinking = state.config.machineStarts;
      state.dialog = null;
      state.tutorialStep = null;
    }))
    dialog.close();
    if (state.config.machineStarts) {
      machinePlays();
    }
  }

  const startTutorial = () => {
    setState(produce(state => {
      state.pieces = initPieces();
      state.played = [];
      state.outcome = null;
      state.turn = 0;
      state.isThinking = false;
      state.dialog = null;
      state.tutorialStep = 0;
    }))
  }

  const tutorialPred = () => {
    setState("tutorialStep", step => Math.max(0, step! - 1));
  }

  const tutorialNext = () => {
    if (state.tutorialStep === null)
      return;
    const action = tutorial[state.tutorialStep].action;
    if (action.type === 'playerAction')
      return;
    batch(() => {
      if (action.type === 'machineAction')
        playAux(action.from, action.to);
      setState("tutorialStep", step => Math.min(tutorial.length - 1, step! + 1));
    });
  }

  const tutorialPlay = (from: number, to: number) => {
    console.log(from, to);
    if (state.tutorialStep === null)
      return;
    const wanted = tutorial[state.tutorialStep].action;
    if (wanted.type !== 'playerAction' || from !== wanted.from || to !== wanted.to) {
      return;
    }

    batch(() => {
      playAux(from, to);
      setState("tutorialStep", step => Math.min(tutorial.length - 1, step! + 1));
    })
  }


  return (
    <>
      <audio src="./move.webm" preload="auto" ref={moveAudio} />
      <audio src="./capture.webm" preload="auto" ref={captureAudio} />
      <div class="relative w-screen min-h-screen bg-main bg-cover bg-no-repeat flex flew-row items-center justify-around portrait:flex-col">
        <div class="absolute bg-white w-full h-full opacity-30 z-10 pointer-events-none" />
        <div class="flex flex-col bg-board b-cover p-6 border-2 border-black rounded-xl gap-4 z-20">
          <div class="text-4xl">Catch the lion</div>
          <button class="btn" onClick={openNewGameDialog}>Nouvelle partie</button>
          <button class="btn" onClick={undo}>Annuler</button>
          <button class="btn" onClick={startTutorial}>Tutoriel</button>
          <button class="btn" onClick={openRulesDialog}>Règles</button>
          <button class="btn" onClick={openCreditsDialog}>Crédits</button>
        </div>
        {state.tutorialStep === null ?
          <Board
            pieces={state.pieces}
            turn={state.turn}
            lastMove={last(state.played)?.move ?? null}
            canPlay={!state.isThinking && state.outcome === null}
            wantedMove={null}
            play={play}
          />
          : <Board
            pieces={state.pieces}
            turn={state.turn}
            lastMove={last(state.played)?.move ?? null}
            canPlay={tutorial[state.tutorialStep].action.type === 'playerAction'}
            wantedMove={wantedMove()}
            play={tutorialPlay}
          />
        }
        <Info
          outcome={state.outcome}
          isThinking={state.isThinking}
          adversary={state.config.adversary}
          tutorialStep={state.tutorialStep}
          tutorialNext={tutorialNext}
          tutorialPred={tutorialPred}
        />
      </div>
      <dialog
        class="dialog"
        ref={dialog}
      >
        {state.dialog === "newgame"
          ?
          <NewGame
            config={state.config}
            closeDialog={closeDialog}
            newGame={newGame}
          />
          : state.dialog === "rules"
          ? <Rules closeDialog={closeDialog} />
          : state.dialog === "credits"
          ? <Credits closeDialog={closeDialog} />
          : null
        }
      </dialog>
    </>
  )
}

export default App;