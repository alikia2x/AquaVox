<script lang="ts">
    import type { Writable } from 'svelte/store';
    export let coverPath: Writable<string>;
    export let hasLyrics: boolean;
    let path: string = '';

    coverPath.subscribe((p) => {
        if (p) path = p;
    });
</script>

{#if hasLyrics}
<img
    class="absolute shadow-md select-none z-10 object-cover rounded-lg md:rounded-2xl max-md:h-20 max-xl:h-32 max-xl:top-6 md:max-h-[calc(94vh-20rem)] xl:w-auto max-w-[90%] xl:max-w-[37vw]
    md:bottom-80 left-6 md:left-[calc(7vw-1rem)] lg:left-[calc(12vw-1rem)] xl:translate-x-[-50%] xl:left-[25vw]"
    src={path}
    alt="封面"
/>
{:else}
<img
    class="absolute shadow-md select-none z-10 object-cover rounded-2xl max-h-[calc(94vh-18rem)] md:max-h-[calc(94vh-20rem)] xl:w-auto max-w-[90%] md:max-w-[75%] xl:max-w-[37vw]
    bottom-72 md:bottom-80 left-1/2 translate-x-[-50%]"
    src={path}
    alt="封面"
/>
{/if}