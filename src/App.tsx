import { batch, Component } from 'solid-js';
import { createStore } from "solid-js/store";
import Board from './components/Board';
import Info from './components/Info';
import { initState } from './model';

const App: Component = () => {
  let newGameDialog!: HTMLDialogElement;

  const [state, setState] = createStore(initState());

  const playAux = (from: number, to: number) => {
    const owner = state.pieces[from].owner;
    const type = state.pieces[from].type;
    batch(() => {
      let j = state.pieces.findIndex(piece => piece.position === to);
      if (j >= 0) {
        setState("pieces", j, { position: null, owner });
        setState("pieces", j, "type", type => type === 'H' ? 'C' : type);
        if (state.pieces[j].type === 'L') {
          setState("outcome", owner);
        }
      }
      setState("pieces", from, "position", to);
      if (type === 'C' && (owner && to > 8 || !owner && to < 3)) {
        setState("pieces", from, "type", 'H');
      }
      setState("turn", turn => turn === 0 ? 1 : 0);
    });
  }

  const play = (from: number, to: number) => {
    playAux(from, to);
  }

  return (
    <>
      <div class="relative w-screen min-h-screen bg-main bg-contain flex flew-row items-center justify-around portrait:flex-col">
        <div class="absolute bg-white w-full h-full opacity-30 z-10 pointer-events-none"/>
        <div class="flex flex-col bg-board b-cover p-6 border-2 border-black rounded-xl gap-4 z-20">
          <div class="text-4xl">Catch the lion</div>
          <button class="btn">Nouvelle partie</button>
          <button class="btn">Annuler</button>
          <button class="btn">Information</button>
        </div>
        <Board
          pieces={state.pieces}
          turn={state.turn}
          outcome={state.outcome}
          play={play}
        />
        <Info
          outcome={state.outcome}
        />
      </div>
      <dialog
        class="dialog"
        ref={newGameDialog}
      >
      </dialog>
    </>
  )
}

export default App;