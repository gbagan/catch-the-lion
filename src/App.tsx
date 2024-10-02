import { batch, Component } from 'solid-js';
import { createStore, produce } from "solid-js/store";
import Board from './components/Board';
import Info from './components/Info';
import { Config, initPieces, initState } from './model';
import NewGame from './components/NewGame';
import { delay, last } from './util';
import Worker from './worker?worker';

const App: Component = () => {
  let newGameDialog!: HTMLDialogElement;

  const [state, setState] = createStore(initState());

  const worker = new Worker();

  function workerTask(data: any): Promise<[number, number]> {
    return new Promise(resolve => {
      worker.onmessage = function(e) {
        resolve(e.data);
      };
      worker.postMessage(data);
    });
  }

  const playAux = (from: number, to: number) => {
    const {owner, type, position} = state.pieces[from];
    const fromPos = state.pieces[from].position; 
    batch(() => {
      const piecesCopy = state.pieces.map(piece => ({...piece}));
      setState("played", state.played.length, {pieces: piecesCopy, move: [fromPos, to]});
      let j = state.pieces.findIndex(piece => piece.position === to);
      if (j >= 0) {
        setState("pieces", j, { position: null, owner });
        setState("pieces", j, "type", type => type === 'H' ? 'C' : type);
        if (state.pieces[j].type === 'L') {
          setState("outcome", owner);
        }
      }
      setState("pieces", from, "position", to);
      if (type === 'C' && position !== null && (owner && to > 8 || !owner && to < 3)) {
        setState("pieces", from, "type", 'H');
      }
      setState("turn", turn => turn === 0 ? 1 : 0);
    });
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
      const data = {
        pieces: state.pieces.map(p => ({...p})),
        turn: state.turn,
        adversary: state.config.adversary
      };
      const [[from2, to2]] = await Promise.all([workerTask(data), delay(1500)]);
      batch(() => {
        setState("isThinking", false);
        playAux(from2, to2);
      })
    }
  }

  const undo = () => {
    if (state.isThinking)
      return
    
    setState(produce(state => {
      if (state.played.length) {
        const pieces = state.played.pop()!.pieces;
        state.pieces = pieces;
        state.turn = state.turn === 0 ? 1 : 0;
        state.outcome = null;
      }
      if (state.played.length % 2 === 1 && state.config.adversary !== 'human') {
        const pieces = state.played.pop()!.pieces;
        state.pieces = pieces;
        state.turn = state.turn === 0 ? 1 : 0;
      }
    }));
  }

  const openNewGameDialog = () => {
    setState("dialogOpened", true);
    newGameDialog.showModal();
  }

  const closeNewGameDialog = () => {
    newGameDialog.close();
    setState("dialogOpened", false);
  }

  const newGame = (config: Config) => {
    setState(produce(state => {
      state.config = { ...config };
      state.pieces = initPieces();
      state.played = [];
      state.outcome = null;
      state.turn = 0;
      //state.isThinking = false;
      state.dialogOpened = false;
    }))
    newGameDialog.close();
  }

  return (
    <>
      <div class="relative w-screen min-h-screen bg-main bg-cover bg-no-repeat flex flew-row items-center justify-around portrait:flex-col">
        <div class="absolute bg-white w-full h-full opacity-30 z-10 pointer-events-none"/>
        <div class="flex flex-col bg-board b-cover p-6 border-2 border-black rounded-xl gap-4 z-20">
          <div class="text-4xl">Catch the lion</div>
          <button class="btn" onClick={openNewGameDialog}>Nouvelle partie</button>
          <button class="btn" onClick={undo}>Annuler</button>
          <button class="btn">Tutoriel</button>
          <button class="btn">Information</button>
        </div>
        <Board
          pieces={state.pieces}
          turn={state.turn}
          lastMove={last(state.played)?.move ?? null}
          canPlay={!state.isThinking && state.outcome === null}
          play={play}
        />
        <Info
          outcome={state.outcome}
          isThinking={state.isThinking}
          adversary={state.config.adversary}
        />
      </div>
      <dialog
        class="dialog"
        ref={newGameDialog}
      >
        {state.dialogOpened && 
          <NewGame
            config={state.config}
            closeDialog={closeNewGameDialog}
            newGame={newGame}
          />
        }
      </dialog>
    </>
  )
}

export default App;