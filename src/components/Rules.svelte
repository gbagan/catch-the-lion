<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import Emph from "./Emph.svelte";
  type Props = { closeDialog: () => void };
  let { closeDialog }: Props = $props();
</script>

<Dialog title="Règles de Catch The Lion" onOk={closeDialog}>
  <ul>
    <li><Emph>Catch the lion</Emph> est un jeu à deux joueurs sur un plateau 4x3.
      Le but est de capturer le <Emph>lion</Emph> adverse.
    </li>
    <li>Chaque joueur possède 4 pièces: un <Emph>lion</Emph>, une <Emph>girafe</Emph>,
        un <Emph>éléphant</Emph> et un <Emph>poussin</Emph>.
    </li>
    <li>L'<Emph>orientation</Emph> d'une pièce indique à quel joueur elle appartient.</li>
    <li>Chaque pièce peut se déplacer d'une case dans une des directions indiquées sur la pièce<br/>
        si la case d'arrivée est vide ou si il y a une pièce adverse dessus.
    </li>
    <li>Une pièce peut <Emph>capturer</Emph> une pièce adverse en se déplaçant dessus.<br/>
        La pièce capturée va dans sa <Emph>réserve</Emph> et il peut la placer sur
        n'importe quelle case vide à partir du tour suivant.
    </li>
    <li>Si un <Emph>poussin</Emph> atteind la dernière rangée, il est promu en <Emph>poule</Emph>.<br/>
        Si la poule se fait capturer, elle redevient un poussin.
    </li>
    <li>Un <Emph>poussin</Emph> placé depuis la réserve sur la dernière
        rangée ne devient pas une poule.
    </li>
    <li>Tu peux également gagner la partie en emmenant ton <Emph>lion</Emph> sur la dernière rangée.<br/>
          Le lion ne doit pas pouvoir être immédiatement capturé par l&apos;adversaire.
    </li>
  </ul>
</Dialog>