<script lang="ts">
  import { Snippet } from "svelte";

  type Props = {
    disabled?: boolean;
    onclick: () => void;
    children: Snippet;
  }

  let { disabled=false, onclick, children }: Props = $props();
</script>

<button {disabled} {onclick}>{@render children()}</button>

<style>
  button {
    padding-left: 1rem;   /* px-4 */
    padding-right: 1rem;
    padding-top: 0.5rem;  /* py-2 */
    padding-bottom: 0.5rem;
  
    font-size: 0.875rem;  /* text-sm (14px) */
    line-height: 1.25rem;
    font-weight: 500;     /* font-medium */
  
    color: rgb(55, 65, 81);         /* text-gray-700 */
    background-color: transparent;  /* bg-transparent */
  
    border: 1px solid rgb(31, 41, 55); /* border-gray-800 */
  
    border-radius: 0.25rem; /* Tailwind met une petite arrondie par défaut pour btn ? Ici je l’ajoute si tu veux cohérent */
    cursor: pointer;

    &:hover {
      background-color: rgba(253, 224, 71, 0.5); /* hover:bg-yellow-300/50 */
      color: rgb(29, 78, 216); /* hover:text-blue-700 */
    }

    &:disabled {
      opacity: 0.5;               /* disabled:opacity-50 */
     cursor: not-allowed;        /* disabled:cursor-not-allowed */
    }
  }
</style>