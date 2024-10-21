<script lang="ts">
    import type { LrcJsonData } from '$lib/lyrics/type';
    import { onMount } from 'svelte';
    import type { ScriptItem } from '$lib/lyrics/type';
    import LyricLine from './lyricLine.svelte';
    import type { LyricPos } from './type';

    // Props
    export let originalLyrics: LrcJsonData;
    export let progress: number;
    export let player: HTMLAudioElement | null;

    // States
    let lyricLines: ScriptItem[] = [];
    let lyricExists = false;
    let lyricsContainer: HTMLDivElement | null;
    let debugMode = false;
    let showTranslation = false;

    // Exlpaination:
    // The hot module reloading makes the each lyric component position to be re-initialized,
    // which causes the lyrics are all at {x: 0, y: 0},
    // instead of the value calculated in the initLyricComponents.
    // So, we need to store the initial position of each lyric component and restore it.
    let lyricComponentInitPos = Array<LyricPos>(lyricLines.length).fill({ x: 0, y: 0 });

    // References to lyric elements
    let lyricElements: HTMLDivElement[] = [];
    let lyricComponents: LyricLine[] = [];

    function initLyricComponents() {
        let cumulativeHeight = 0;
        const marginY = 48;
        for (let i = 0; i < lyricLines.length; i++) {
            const c = lyricComponents[i];
            lyricElements.push(c.getRef());
            const e = lyricElements[i];
            const elementHeight = e.getBoundingClientRect().height;
            const elementTargetTop = cumulativeHeight;
            cumulativeHeight += elementHeight + marginY;
            lyricComponentInitPos[i] = { x: 0, y: elementTargetTop };
        }
    }

    $: {
        if (originalLyrics && originalLyrics.scripts) {
            lyricExists = true;
            lyricLines = originalLyrics.scripts!;
        }
    }

    $: {
        if (lyricComponents.length > 0) {
            initLyricComponents();
        }
    }

    onMount(() => {
        // Initialize
        if (localStorage.getItem('debugMode') == null) {
            localStorage.setItem('debugMode', 'false');
        } else {
            debugMode = localStorage.getItem('debugMode')!.toLowerCase() === 'true';
        }
    });
</script>

{#if originalLyrics && originalLyrics.scripts}
    <div
        class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 lg:px-[7.5rem] xl:left-[45vw] xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar overflow-y-auto z-[1] pt-16"
        bind:this={lyricsContainer}
    >
        {#each lyricLines as lyric, i}
            <LyricLine
                line={lyric}
                index={i}
                bind:this={lyricComponents[i]}
                {debugMode}
                initPos={lyricComponentInitPos[i]}
            />
        {/each}
        <div class="relative w-full h-[50rem]"></div>
    </div>
{/if}
