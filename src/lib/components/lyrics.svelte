<script lang="ts">
    import userAdjustingProgress from '$lib/state/userAdjustingProgress';
    import createLyricsSearcher from '$lib/lyrics/lyricSearcher';
    import progressBarRaw from '$lib/state/progressBarRaw';
    import type { LrcJsonData } from 'lrc-parser-ts';
    export let lyrics: string[];
    export let originalLyrics: LrcJsonData;
    export let progress: number;

    let getLyricIndex: Function;
    const debugMode = false;
    let currentLyricIndex = -1;
    let currentPositionIndex = -1;
    let currentAnimationIndex = -1;
    let lyricsContainer: HTMLDivElement;
    let nextUpdate = -1;
    let lastAdjustProgress = 0;

    let refs: HTMLParagraphElement[] = [];
    let _refs: any[] = [];
    $: refs = _refs.filter(Boolean);
    $: getLyricIndex = createLyricsSearcher(originalLyrics);

    function getClass(lyricIndex: number, progress: number) {
        if (!originalLyrics.scripts) return 'previous-lyric';
        if (currentLyricIndex === lyricIndex) return 'current-lyric';
        else if (progress > originalLyrics.scripts[lyricIndex].end) return 'after-lyric';
        else return 'previous-lyric';
    }

    $: {
        if (lyricsContainer && originalLyrics && originalLyrics.scripts) {
            const scripts = originalLyrics.scripts;
            currentPositionIndex = getLyricIndex(progress);
            const cl = scripts[currentPositionIndex];
            if (cl.start <= progress && progress <= cl.end) {
                currentLyricIndex = currentPositionIndex;
                nextUpdate = cl.end;
            } else {
                currentLyricIndex = -1;
                nextUpdate = cl.start;
            }
            if ($userAdjustingProgress === false) {
                for (let i = 0; i < scripts.length; i++) {
                    const offset = Math.abs(i - currentPositionIndex);
                    const blurRadius = Math.min(offset * 1.5, 16);
                    if (refs[i]) {
                        refs[i].style.filter = `blur(${blurRadius}px)`;
                    }
                }
            }
        }
    }

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function a(h: number) {
        let pos = currentPositionIndex + 2;
        for (let i = currentPositionIndex + 2; i < refs.length; i++) {
            const lyric = refs[i];
            lyric.style.transition =
                'transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
            lyric.style.transform = `translateY(${-h}px)`;
            pos = i;
            await sleep(75);
            if (refs[i - 2].getBoundingClientRect().top > lyricsContainer.getBoundingClientRect().height) break;
        }
        for (let i = pos; i < refs.length; i++) {
            refs[i].style.transition =
                'transform 0s, filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
            const h = refs[i].getBoundingClientRect().height;
            refs[i].style.transform = `translateY(${-h}px)`;
        }
        await sleep(650);
        for (let i = 0; i < refs.length; i++) {
            refs[i].style.transition =
                'transform 0s, filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
        }
        for (let i = 0; i < refs.length; i++) {
            refs[i].style.transform = `translateY(0px)`;
        }
        lyricsContainer.scrollTop += h;
    }

    async function b(currentLyric: HTMLParagraphElement) {
        if (!originalLyrics || !originalLyrics.scripts || !lyricsContainer) return;
        lyricsContainer.scrollTop += currentLyric.getBoundingClientRect().top - 144;
    }

    userAdjustingProgress.subscribe((v) => {
        if (!originalLyrics) return;
        const scripts = originalLyrics.scripts;
        if (!scripts) return;
        if (v) {
            console.log('!');
            for (let i = 0; i < scripts.length; i++) {
                refs[i].style.filter = `blur(0px)`;
            }
        } else {
            for (let i = 0; i < scripts.length; i++) {
                const offset = Math.abs(i - currentPositionIndex);
                const blurRadius = Math.min(offset * 1.5, 16);
                if (refs[i]) {
                    refs[i].style.filter = `blur(${blurRadius}px)`;
                }
            }
        }
    });

    progressBarRaw.subscribe((progress: number) => {
        if ($userAdjustingProgress === false && getLyricIndex) {
            const currentLyric = refs[getLyricIndex(progress)];
            b(currentLyric);
            lastAdjustProgress = currentPositionIndex;
        }
    });

    $: {
        if ($userAdjustingProgress) {
            nextUpdate = progress;
        } else {
            if (0 < nextUpdate - progress && nextUpdate - progress < 0.05) {
                if (
                    currentPositionIndex >= 0 &&
                    currentPositionIndex !== currentAnimationIndex &&
                    currentPositionIndex !== lastAdjustProgress
                ) {
                    const offsetHeight =
                        refs[currentPositionIndex].getBoundingClientRect().height +
                        refs[currentPositionIndex].getBoundingClientRect().top -
                        144;
                    const currentLyric = refs[currentPositionIndex];
                    currentLyric.style.transition =
                        'transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
                    currentLyric.style.transform = `translateY(${-offsetHeight}px)`;

                    for (let i = currentPositionIndex - 1; i >= 0; i--) {
                        refs[i].style.transition =
                            'transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
                        const h = refs[i].getBoundingClientRect().height;
                        refs[i].style.transform = `translateY(${-offsetHeight}px)`;
                    }
                    if (currentPositionIndex + 1 < refs.length) {
                        const nextLyric = refs[currentPositionIndex + 1];
                        nextLyric.style.transition =
                            'transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
                        nextLyric.style.transform = `translateY(${-offsetHeight}px)`;
                        a(offsetHeight);
                    }
                    currentAnimationIndex = currentPositionIndex;
                }
            }
        }
    }
</script>

{#if lyrics && originalLyrics}
    <div
        class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 lg:px-[7.5rem] xl:left-[45vw] xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar overflow-y-auto z-[1] pt-16 lyrics"
        bind:this={lyricsContainer}
    >
        {#if debugMode}
            <p class="fixed top-6 right-20">
                LyricIndex: {currentLyricIndex} PositionIndex: {currentPositionIndex} AnimationIndex:{currentAnimationIndex}
                NextUpdate: {Math.floor(nextUpdate / 60)}m {Math.round((nextUpdate % 60) * 100) / 100}s
            </p>
        {/if}
        {#each lyrics as lyric, i}
            <p bind:this={_refs[i]} class={`${getClass(i, progress)} text-shadow-lg`}>
                {#if debugMode}
                    <span class="text-lg absolute">{i}</span>
                {/if}
                {lyric}
            </p>
        {/each}
        <div class="relative w-full h-[50rem]"></div>
    </div>
{/if}

<style>
    .lyrics {
        mask-image: linear-gradient(
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 2rem,
            rgba(0, 0, 0, 1) calc(100% - 5rem),
            rgba(0, 0, 0, 0) 100%
        );
    }
    .no-scrollbar {
        scrollbar-width: 10px;
    }
    .no-scrollbar::-webkit-scrollbar {
        width: 10px;
    }
    .current-lyric {
        position: relative;
        color: white;
        font-weight: 600;
        font-size: 2.1rem;
        line-height: 2.7rem;
        margin: 1rem 0rem;
        scale: 1.02 1;
        top: 1rem;
    }
    .previous-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 2.1rem;
        line-height: 2.7rem;
        margin: 1rem 0rem;
        top: 1rem;
    }
    .after-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 2.1rem;
        line-height: 2.7rem;
        margin: 1rem 0rem;
        top: 1rem;
    }
    @media (min-width: 768px) {
        .current-lyric {
            font-size: 3rem;
            line-height: 4rem;
            margin: 2.4rem 0rem;
        }
        .after-lyric {
            font-size: 3rem;
            line-height: 3.3rem;
            margin: 2.4rem 0rem;
        }
        .previous-lyric {
            font-size: 3em;
            line-height: 3.3rem;
            margin: 2.4rem 0rem;
        }
    }

    @media (min-width: 1024px) {
        .current-lyric {
            font-size: 3.5rem;
            line-height: 6.5rem;
            margin: 0rem 0rem;
        }
        .after-lyric {
            font-size: 3.5rem;
            line-height: 6.5rem;
            margin: 0rem 0rem;
        }
        .previous-lyric {
            font-size: 3.5rem;
            line-height: 6.5rem;
            margin: 0rem 0rem;
        }
    }
</style>
