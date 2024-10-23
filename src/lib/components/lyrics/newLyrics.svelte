<script lang="ts">
    import type { LrcJsonData } from '$lib/lyrics/type';
    import { onMount } from 'svelte';
    import type { ScriptItem } from '$lib/lyrics/type';
    import LyricLine from './lyricLine.svelte';
    import type { LyricLayout, LyricPos } from './type';
    import createLyricsSearcher from '$lib/lyrics/lyricSearcher';

    // Props
    export let originalLyrics: LrcJsonData;
    export let progress: number;
    export let player: HTMLAudioElement | null;

    // States
    let lyricLines: ScriptItem[] = [];
    let lyricExists = false;
    let lyricsContainer: HTMLDivElement | null;
    let lyricLayouts: LyricLayout[] = [];
    let debugMode = false;
    let showTranslation = false;

    // References to lyric elements
    let lyricElements: HTMLDivElement[] = [];
    let lyricComponents: LyricLine[] = [];
    let lyricTopList: number[] = [];
    let nextUpdate = 0;
    const marginY = 48;

    $: getLyricIndex = createLyricsSearcher(originalLyrics);

    function initLyricComponents() {
        initLyricTopList();
        for (let i = 0; i < lyricComponents.length; i++) {
            lyricComponents[i].init({ x: 0, y: lyricTopList[i] });
        }
    }

    function initLyricTopList() {
        let cumulativeHeight = 0;
        for (let i = 0; i < lyricLines.length; i++) {
            const c = lyricComponents[i];
            lyricElements.push(c.getRef());
            const e = lyricElements[i];
            const elementHeight = e.getBoundingClientRect().height;
            const elementTargetTop = cumulativeHeight;
            cumulativeHeight += elementHeight + marginY;
            lyricTopList.push(elementTargetTop);
        }
    }

    function computeLayout(progress: number) {
        if (!originalLyrics.scripts) return;
        const currentLyricIndex = getLyricIndex(progress);
        const currentLyricDuration =
            originalLyrics.scripts[currentLyricIndex].end - originalLyrics.scripts[currentLyricIndex].start;
        const relativeOrigin = lyricTopList[currentLyricIndex];
        for (let i = 0; i < lyricElements.length; i++) {
            const currentLyricComponent = lyricComponents[i];
            lyricLayouts[i] = {
                blur: 0,
                scale: 1,
                pos: {
                    y: lyricTopList[i] - relativeOrigin,
                    x: 0
                }
            };
            let delay = 0;
            if (i <= currentLyricIndex) {
                delay = 0;
            } else {
                delay = 0.013 + Math.min(Math.min(currentLyricDuration, 0.3), 0.075 * (i - currentLyricIndex));
            }
            currentLyricComponent.update({ x: 0, y: lyricTopList[i] - relativeOrigin }, delay);
        }
        nextUpdate = originalLyrics.scripts[currentLyricIndex + 1].start;
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

    $: {
        if (lyricsContainer && lyricComponents.length > 0) {
            if (progress >= nextUpdate) computeLayout(progress);
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
            <LyricLine line={lyric} index={i} bind:this={lyricComponents[i]} {debugMode} />
        {/each}
        <div class="relative w-full h-[50rem]"></div>
    </div>
{/if}
