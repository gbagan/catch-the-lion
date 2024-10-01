import { Component } from "solid-js";
import { Adversary, Config } from "../model";
import { createStore } from "solid-js/store";

type NewGameComponent = Component<{
  config: Config,
  closeDialog: () => void,
  newGame: (config: Config) => void,
}>

const adversaries = [["human", "Humain"], ["level1", "Débutant"], ["level2", "Moyen"], ["level3", "Difficile"]]

const NewGame: NewGameComponent = props => {
  const [config, setConfig] = createStore({...props.config});

  return (
    <>
      <div class="dialog-title">Nouvelle partie</div>
      <div class="dialog-body grid grid-cols-20/80 gap-8">
        <div class="text-bold text-lg">Adversaire</div>
        <div class="flex gap-4 text-lg">
          {adversaries.map(([name, fullname]) =>
            <button
              class="togglebtn"
              classList={{"toggledbtn": name === config.adversary}}
              onClick={e => setConfig("adversary", name as Adversary)}
            >
              {fullname}
            </button>
          )}
        </div>
        <div class="text-bold text-lg">Qui commence</div>
        <div class="flex gap-4 text-lg">
          {[0, 1].map(i =>
            <button
              class="togglebtn"
            >
              {i === 0 ? "Humain" : "Machine"}
            </button>
          )}
        </div>
      </div>
      <div class="dialog-buttons">
        <button class="btn" onClick={props.closeDialog}>Annuler</button>
        <button class="btn" onClick={[props.newGame, config]}>OK</button>
      </div>
    </>
  )
}

export default NewGame;