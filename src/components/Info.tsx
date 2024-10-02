import { Component, createMemo, createSignal, onMount } from "solid-js";
import { Transition } from "solid-transition-group";
import { Adversary } from "../model";
import { delay } from "../util";

const messages: [string, number][] = [
  ["Bienvenue sur l'appli Catch the lion", 3000],
  ['"Catch the lion" connu en japonais sous le nom "Dobutsu Shogi" est une variante pour enfants du Shogi.', 5000],
  ["Le jeu a été entièrement résolu par ordinateur. Il existe 1 567 925 964 configurations possibles.", 5000],
  ["Pour apprendre les règles, tu peux clicker sur Tutoriel", 3000]
]

type InfoComponent = Component<{
  outcome: null | 0 | 1,
  adversary: Adversary,
  isThinking: boolean,
}>

const Info: InfoComponent = props => {
  const [periodicMessage, setPeriodicMessage] = createSignal<string | null>("");
  
  onMount(async () => {
    let i = 0;
    while (true) {
      const d = messages[i][1];
      setPeriodicMessage(messages[i][0]);
      await delay(d);
      setPeriodicMessage(null);
      i = (i + 1) % messages.length;
      await delay(2000);
    }
  })

  const message = createMemo(() => 
    props.outcome !== null
      ? (
          props.adversary === 'human' 
          ? `Bravo! Le joueur ${props.outcome + 1} a gagné!`
          : props.outcome === 0
          ? `Zut! J'ai perdu! Tu peux changer de difficulté en clickant sur nouvelle partie!`
          : `Oh oui! J'ai gagné! Tu peux changer de difficulté en clickant sur nouvelle partie!`
        )
      : periodicMessage()
  );

  const girlExpression = createMemo(() =>
    props.isThinking
    ? "bg-thinking"
    : props.outcome !== null && props.outcome === 0 && props.adversary !== 'human'
    ? "bg-crying"
    : props.outcome !== null && (props.outcome === 1 || props.adversary === 'human')
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