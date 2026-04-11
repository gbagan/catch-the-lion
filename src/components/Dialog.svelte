<script lang="ts">
  import { Snippet } from "svelte";
  import Button from "./Button.svelte";

  type Props = {
    title: string;
    onOk?: () => void;
    onCancel?: () => void;
    children: Snippet;
  }

  const {title, onOk , onCancel, children}: Props = $props();
</script>

<div class="title">
  {title}
</div>
<div class="body">
  {@render children()}
</div>
<div class="buttons">
  {#if onCancel}
    <Button onclick={onCancel}>Annuler</Button>
  {/if}
  {#if onOk}
    <Button onclick={onOk}>OK</Button>
  {/if}
</div>

<style>
  .title {
    padding: 1rem;
    min-height: 2rem;
    border-bottom-width: 2px;
    border-bottom-color: black;
    border-bottom-style: solid; 
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 500;
  }

  .body {
    padding: 2.5rem;
    border-bottom-width: 2px;
    border-bottom-color: black;
    border-bottom-style: solid; 
  }

  .buttons {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
</style>