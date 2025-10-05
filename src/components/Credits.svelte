<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import Emph from "./Emph.svelte"
  type Props = { closeDialog: () => void }
  let {closeDialog }: Props = $props();
</script>

<Dialog title="Crédits" onOk={closeDialog}>
  <ul>
    <li><Emph>Catch the lion</Emph> est un jeu de plateau créé
      par Madoka Kitao et Maiko Fujita.</li>
    <li>L'éditeur du jeu est Nekomado.</li>
    <li>Les différentes images ont été générées par Dall-E.</li>
    <li>Les différents sons proviennent de la plate-forme Lichess.</li>
  </ul>  
</Dialog>