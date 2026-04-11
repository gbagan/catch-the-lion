<script lang="ts">
  import { Snippet } from "svelte";

  type Props = {
    color?: "red" | "blue" | "green";
    children: Snippet;
  }

  let { color="green", children }: Props = $props();
//export Green := (props: {children: string}) => <span class="text-green-500 font-bold">{props.children}
//export Red := (props: {children: string}) => <span class="text-red-500 font-bold">{props.children}
//export Blue := (props: {children: string}) => <span class="text-blue-500 font-bold">{props.children}
</script>

<span class={color === "green" ? "green" : color === "red" ? "red" : "blue"}>
  {@render children()}
</span>

<style>
  .green {
    color: rgb(34, 197, 94);
    font-weight: 700;
  }
  .red {
    color: rgb(239, 68, 68);
    font-weight: 700;
  }
  .blue {
    color: rgb(59, 130, 246);
    font-weight: 700;
  }
</style>