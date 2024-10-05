import { Component } from "solid-js";
import Emph from "./Emph";

const Rules: Component<{closeDialog: () => void}> = props =>
  <>
    <div class="dialog-title">Règles de Catch the lion</div>
    <div class="dialog-body">
      <ul>
        <li class="list-disc"><Emph>Catch the lion</Emph> est un jeu à deux joueurs sur un plateau 4x3.
        Le but est de capturer le <Emph>lion</Emph> adverse.</li>
        <li class="list-disc">Chaque joueur possède 4 pièces: un <Emph>lion</Emph>, une <Emph>girafe</Emph>, un <Emph>éléphant</Emph> et un <Emph>poussin</Emph>.</li>
        <li class="list-disc">L'<Emph>orientation</Emph> d'une pièce indique à quel joueur elle appartient.</li>
        <li class="list-disc">Chaque pièce peut se déplacer d'une case dans une des directions indiquées sur la pièce<br/>
            si la case d'arrivée est vide ou si il y a une pièce adverse dessus.</li>
        <li class="list-disc">Une pièce peut <Emph>capturer</Emph> une pièce adverse en se déplaçant dessus.<br/>
            La pièce capturée va dans sa <Emph>réserve</Emph> et il peut la place sur n'importe quelle case vide à partir du tour suivant.
        </li>
        <li class="list-disc">Si un <Emph>poussin</Emph> atteind la dernière rangée, il est promu en <Emph>poule</Emph>.<br/>
            Si la poule se fait capturer, elle redevient un poussin.
        </li>
        <li class="list-disc">Un <Emph>poussin</Emph> placé depuis la réserve sur la dernière rangée ne devient pas une poule.
        </li>
        <li class="list-disc">Tu peux également gagner la partie en emmenant ton <Emph>lion</Emph> sur la dernière rangée.<br/>
            Le lion ne doit pas pouvoir être immédiatement capturé par l'adversaire. 
        </li>
      </ul>
    </div>
    <div class="dialog-buttons">
      <button class="btn" onClick={props.closeDialog}>OK</button>
    </div>
  </>

export default Rules;