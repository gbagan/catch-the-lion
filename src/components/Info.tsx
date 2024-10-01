import { Component, createMemo, createSignal, onMount } from "solid-js";
import { Transition } from "solid-transition-group";

const messages: [string, number][] = [
  ["Bienvenue sur l'appli Gomoku", 4000],
  ["Gomoku connu aussi sous le nom de Darpion est un jeu positionnel japonais d'origine chinoise.", 5000],
  ["Il existe de nombreuses variantes: Libre, Renju, Caro, Omok, Ninuki-renju", 5000]
]

type InfoComponent = Component<{
  outcome: null | 0 | 1,
}>

const Info: InfoComponent = props => {
  const message = createMemo(() => 
    props.outcome !== null
      ? `Bravo! Le joueur ${props.outcome + 1} a gagné!`
      : "Bienvenue sur l'appli");

  const girlExpression = createMemo(() =>
    props.outcome !== null
    ? "bg-happy"
    : "bg-speaking"
  )

  return (
    <div class={`relative w-[15rem] h-[25rem] bg-contain bg-no-repeat ${girlExpression()}`}>
      <Transition
        onEnter={(el, done) => {
          const a = el.animate([
            { opacity: 0 },
            { opacity: 1 }], {
            duration: 500
          }
          );
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate([
            { opacity: 1 },
            { opacity: 0 }], {
            duration: 500
          }
          );
          a.finished.then(done);
        }}
      >
        {message() && <div class="tooltip">{message()}</div>}
      </Transition>
    </div>
  )
}

export default Info;