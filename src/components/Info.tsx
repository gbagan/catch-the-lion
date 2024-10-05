import { Component, createMemo, createSignal, JSXElement, onCleanup, onMount } from "solid-js";
import { Transition } from "solid-transition-group";
import { Adversary } from "../model";
import { delay } from "../util";
import { tutorial } from "../tutorial";
import Emph from "./Emph";

const messages: [JSXElement, number][] = [
  [<>Bienvenue sur l'appli <Emph>Catch the lion</Emph>.</>, 3000],
  [<><Emph>Catch the lion</Emph> connu en japonais sous le nom <Emph>Dobutsu Shogi</Emph> est une variante pour enfants du Shogi.</>, 5000],
  [<>Le jeu a été entièrement résolu par ordinateur. Il existe <Emph>1 567 925 964</Emph> configurations possibles.</>, 5000],
  [<>Si les deux joueurs jouent de manière optimale, la victoire est assurée pour le <Emph>second</Emph> joueur.</>, 5000],
  [<>Pour apprendre les règles, tu peux clicker sur <Emph>Tutoriel</Emph>.</>, 3000]
]

type InfoComponent = Component<{
  outcome: null | 0 | 1 | 2,
  adversary: Adversary,
  isThinking: boolean,
  tutorialStep: number | null,
  tutorialNext: () => void,
  tutorialPred: () => void,
}>

const Info: InfoComponent = props => {
  const [periodicMessage, setPeriodicMessage] = createSignal<JSXElement | null>("");
  let stop = false;

  onMount(async () => {
    let i = 0;
    while (true) {
      const d = messages[i][1];
      setPeriodicMessage(messages[i][0]);
      await delay(d);
      setPeriodicMessage(null);
      i = (i + 1) % messages.length;
      if (stop)
        break;
      await delay(1500);
    }
  });

  onCleanup(() => {
    stop = true;
  });

  const message = createMemo(() =>
    props.tutorialStep !== null
      ? tutorial[props.tutorialStep].text
      : props.outcome !== null
        ? (
          props.outcome === 2
            ? <>Oh, cette configuration de pièces a été répétée 3 fois. C'est un <Emph>match nul</Emph></>
            : props.adversary === 'human'
              ? `Bravo! Le joueur ${props.outcome + 1} a gagné!`
              : props.outcome === 0
                ? <>Zut! J'ai perdu! Tu peux changer de difficulté en cliquant sur <Emph>Nouvelle partie</Emph></>
                : <>Oh oui! J'ai gagné! Tu peux changer de difficulté en cliquant sur <Emph>Nouvelle partie</Emph></>
        )
        : periodicMessage()
  );

  const girlExpression = createMemo(() =>
    props.isThinking
      ? "bg-thinking"
      : props.outcome === 2
        ? "bg-surprised"
        : props.outcome !== null && props.outcome === 0 && props.adversary !== 'human'
          ? "bg-crying"
          : props.outcome !== null && (props.outcome === 1 || props.adversary === 'human')
            ? "bg-happy"
            : "bg-speaking"
  )

  return (
    <div class={`z-20 relative w-[15rem] h-[25rem] bg-contain bg-no-repeat ${girlExpression()}`}>
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
        {message() && <div class="tooltip -right-5">{message()}</div>}
      </Transition>
      {props.tutorialStep !== null &&
        <>
          <div class="absolute -right-2 flex gap-32">
            <button class="tutorial-button" onClick={props.tutorialPred}>Précédent</button>
            <button class="tutorial-button" onClick={props.tutorialNext}>Suivant</button>
          </div>  
        </>
      }
    </div>
  )
}

export default Info;