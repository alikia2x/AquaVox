<script lang="ts">
    import userAdjustingProgress from '$lib/state/userAdjustingProgress';
    import createLyricsSearcher from '$lib/lyrics/lyricSearcher';
    import progressBarRaw from '$lib/state/progressBarRaw';
    import type { LrcJsonData } from 'lrc-parser-ts';
    import progressBarSlideValue from '$lib/state/progressBarSlideValue';
    import nextUpdate from '$lib/state/nextUpdate';

    // Component input properties
    export let lyrics: string[];
    export let originalLyrics: LrcJsonData;
    export let progress: number;

    // Local state and variables
    let getLyricIndex: Function;
    let debugMode = false;
    if (localStorage.getItem('debugMode') == null) {
        localStorage.setItem('debugMode', 'false');
    }
    else {
        debugMode = localStorage.getItem('debugMode')!.toLowerCase() === "true";
    }
    let currentLyricIndex = -1;
    let currentPositionIndex = -1;
    let currentAnimationIndex = -1;
    let lyricsContainer: HTMLDivElement | null;
    let lastAdjustProgress = 0;
    let localProgress = 0;
    let lastScroll = 0;
    let scrolling = false;
    let scriptScrolling = false;

    let currentLyricTopMargin = 288;

    // References to lyric elements
    let refs: HTMLParagraphElement[] = [];
    let _refs: any[] = [];
    $: refs = _refs.filter(Boolean);
    $: getLyricIndex = createLyricsSearcher(originalLyrics);

    // Helper function to get CSS class for a lyric based on its index and progress
    function getClass(lyricIndex: number, progress: number) {
        if (!originalLyrics.scripts) return 'previous-lyric';
        if (currentLyricIndex === lyricIndex) return 'current-lyric';
        else if (progress > originalLyrics.scripts[lyricIndex].end) return 'after-lyric';
        else return 'previous-lyric';
    }

    // Function to move the lyrics up smoothly
    async function moveToNextLine(h: number) {
        console.debug(new Date().getTime() , 'moveToNextLine', h);
        // the line that's going to process (like a pointer)
        // by default, it's "the next line" after the lift
        let processingLineIndex = currentPositionIndex + 2;

        // modify translateY of all lines in viewport one by one to lift them up
        for (let i = processingLineIndex; i < refs.length; i++) {
            const lyric = refs[i];
            lyric.style.transition =
                `transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease,
                font-size 200ms ease, scale 250ms ease`;
            lyric.style.transform = `translateY(${-h}px)`;
            processingLineIndex = i;
            await sleep(75);
            const twoLinesAhead = refs[i - 2];
            if (lyricsContainer && twoLinesAhead.getBoundingClientRect().top > lyricsContainer.getBoundingClientRect().height) break;
        }

        if (refs.length - processingLineIndex < 3) {
            for (let i = processingLineIndex; i < refs.length; i++) {
                const lyric = refs[i];
                lyric.style.transition =
                    'transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
                lyric.style.transform = `translateY(${-h}px)`;
                processingLineIndex = i;
                await sleep(75);
            }
        } else {
            for (let i = processingLineIndex; i < refs.length; i++) {
                refs[i].style.transition =
                    'transform 0s, filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
                const height = refs[i].getBoundingClientRect().height;
                refs[i].style.transform = `translateY(${-height}px)`;
            }
        }

        // wait until the animation end
        await sleep(650);

        // clear the transition to let the following style changes could be done without animation
        for (let i = 0; i < refs.length; i++) {
            refs[i].style.transition =
                'transform 0s, filter 200ms ease, opacity 200ms ease, font-size 200ms ease, scale 250ms ease';
        }
        // reset the translateY, and immediately scroll down to provide visual stability
        for (let i = 0; i < refs.length; i++) {
            refs[i].style.transform = `translateY(0px)`;
        }
        scriptScrolling = true;
        if (lyricsContainer !== null) {
            lyricsContainer.scrollTop += h;
        }
        await sleep(500);
        scriptScrolling = false;
    }

    // Scroll the lyrics container to the given lyric
    async function scrollToLyric(currentLyric: HTMLParagraphElement) {
        if (!originalLyrics || !originalLyrics.scripts || !lyricsContainer) return;
        scriptScrolling = true;
        lyricsContainer.scrollTop += currentLyric.getBoundingClientRect().top - currentLyricTopMargin;
        for (let i = 0; i < refs.length; i++) {
            refs[i].style.transform = 'translateY(0px)';
        }
        setTimeout(() => {
            scriptScrolling = false;
        }, 500);
    }

    // Handle user adjusting progress state changes
    userAdjustingProgress.subscribe((adjusting) => {
        if (!originalLyrics) return;
        const scripts = originalLyrics.scripts;
        if (!scripts) return;
        if (adjusting) {
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

    // Handle progress changes at system level
    progressBarRaw.subscribe((progress: number) => {
        if ($userAdjustingProgress === false && getLyricIndex) {
            if (Math.abs(localProgress - progress) > 0.6) {
                const currentLyric = refs[getLyricIndex(progress)];
                scrollToLyric(currentLyric);
            }
            localProgress = progress;
        }
    });

    // Handle progress bar sliding events
    progressBarSlideValue.subscribe((_) => {
        if ($userAdjustingProgress === false && getLyricIndex) {
            lastAdjustProgress = currentPositionIndex;
        }
    });

    // Handle scroll events in the lyrics container
    function scrollHandler() {
        scrolling = !scriptScrolling;
        if (scrolling && originalLyrics.scripts) {
            lastScroll = new Date().getTime();
            for (let i = 0; i < originalLyrics.scripts.length; i++) {
                if (refs[i]) {
                    refs[i].style.filter = 'blur(0px)';
                }
            }
        }
        setTimeout(() => {
            if (new Date().getTime() - lastScroll > 5000) {
                scrolling = false;
            }
        }, 5500);
    }

    // Utility function to create a sleep/delay
    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Scroll to corresponding lyric while adjusting progress
    $: {
        if ($userAdjustingProgress == true) {
            const currentLyric = refs[getLyricIndex(progress)];
            scrollToLyric(currentLyric);
        }
    }

    // Update the current lyric and apply blur effect based on the progress
    $: {
        (() => {
            if (!lyricsContainer || !originalLyrics.scripts) return;

            const scripts = originalLyrics.scripts;
            currentPositionIndex = getLyricIndex(progress);
            const cl = scripts[currentPositionIndex];

            if (cl.start <= progress && progress <= cl.end) {
                currentLyricIndex = currentPositionIndex;
                nextUpdate.set(cl.end);
            } else {
                currentLyricIndex = -1;
                nextUpdate.set(cl.start);
            }

            const currentLyric = refs[currentPositionIndex];
            if ($userAdjustingProgress || scrolling || currentLyric.getBoundingClientRect().top < 0) return;

            for (let i = 0; i < scripts.length; i++) {
                const offset = Math.abs(i - currentPositionIndex);
                const blurRadius = Math.min(offset * 0.96, 16);
                if (refs[i]) {
                    refs[i].style.filter = `blur(${blurRadius}px)`;
                }
            }
        })();
    }

    nextUpdate.subscribe(async (nextUpdate) => {
        if (
            currentPositionIndex < 0 ||
            currentPositionIndex === currentAnimationIndex ||
            currentPositionIndex === lastAdjustProgress ||
            $userAdjustingProgress === true ||
            scrolling
        ) return;

        const currentLyric = refs[currentPositionIndex];

        if (originalLyrics.scripts && currentLyric.getBoundingClientRect().top < 0) return;

        const offsetHeight =
            refs[currentPositionIndex].getBoundingClientRect().top -
            currentLyricTopMargin;

        // prepare current line
        currentLyric.style.transition = `transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease,
            opacity 200ms ease, font-size 200ms ease, scale 250ms ease`;
        currentLyric.style.transform = `translateY(${-offsetHeight}px)`;

        for (let i = currentPositionIndex - 1; i >= 0; i--) {
            refs[i].style.transition = `transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease,
                opacity 200ms ease, font-size 200ms ease, scale 250ms ease`;
            refs[i].style.transform = `translateY(${-offsetHeight}px)`;
        }
        if (currentPositionIndex + 1 < refs.length) {
            const nextLyric = refs[currentPositionIndex + 1];
            nextLyric.style.transition = `transform .6s cubic-bezier(.28,.01,.29,.99), filter 200ms ease,
                opacity 200ms ease, font-size 200ms ease, scale 250ms ease`;
            nextLyric.style.transform = `translateY(${-offsetHeight}px)`;
            await moveToNextLine(offsetHeight);
        }
        currentAnimationIndex = currentPositionIndex;
    })

    function onKeyDown(e: KeyboardEvent) {
        if (e.altKey && e.shiftKey && (e.metaKey || e.key === 'OS') && e.key === 'Enter') {
            debugMode = !debugMode;
            localStorage.setItem('debugMode', debugMode ? 'true' : 'false');
        }
    }

    function extractTranslateValue(s: string): string | null {
        const regex = /translateY\((-?\d*px)\)/;
        let arr = regex.exec(s);
        return arr==null ? null : arr[1];
    }

</script>

<svelte:window on:keydown={onKeyDown} />

{#if debugMode && lyricsContainer}
    <div
        class="absolute top-6 right-10 font-mono text-sm backdrop-blur-md z-20 bg-[rgba(255,255,255,0.15)] px-2 rounded-xl">
        <p>
            LyricIndex: {currentLyricIndex} PositionIndex: {currentPositionIndex}
            AnimationIndex:{currentAnimationIndex}
            NextUpdate: {$nextUpdate}
            Progress: {progress.toFixed(2)}
            lastAdjustProgress: {lastAdjustProgress}
            scrollPosition: {lyricsContainer.scrollTop}
        </p>
    </div>
{/if}


{#if lyrics && originalLyrics && originalLyrics.scripts}
    <div
        class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 lg:px-[7.5rem] xl:left-[45vw] xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar overflow-y-auto z-[1] pt-16 lyrics"
        bind:this={lyricsContainer}
    >
        {#each lyrics as lyric, i}
            <p bind:this={_refs[i]} class={`${getClass(i, progress)} text-shadow-lg`}>
                {#if debugMode && refs[i] && refs[i].style !== undefined}
                    <span class="text-lg absolute -translate-y-4">{i} &nbsp;
                        {originalLyrics.scripts[i].start} ~ {originalLyrics.scripts[i].end}
                        tY: {extractTranslateValue(refs[i].style.transform)}
                        top: {Math.round(refs[i].getBoundingClientRect().top)}px
                    </span>
                {/if}
                {lyric}
            </p>
        {/each}
        <div class="relative w-full h-[50rem]"></div>
    </div>
{/if}

<!--suppress CssUnusedSymbol -->
<style>
    :root {
        --lyric-mobile-font-size: 2rem;
        --lyric-mobile-line-height: 2.4rem;
        --lyric-mobile-margin: 1.5rem 0;
        --lyric-mobile-font-weight: 700;
        --lyric-desktop-font-size: 3.5rem;
        --lyric-desktop-line-height: 4.5rem;
        --lyric-desktop-margin: 1.75rem 0;
    }

    .lyrics {
        mask-image: linear-gradient(
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 1) 2rem,
                rgba(0, 0, 0, 1) calc(100% - 5rem),
                rgba(0, 0, 0, 0) 100%
        );
    }

    .no-scrollbar {
        scrollbar-width: none;
    }

    .no-scrollbar::-webkit-scrollbar {
        width: 0;
    }

    .current-lyric {
        position: relative;
        color: white;
        font-weight: var(--lyric-mobile-font-weight);
        font-size: var(--lyric-mobile-font-size);
        line-height: var(--lyric-mobile-line-height);
        margin: var(--lyric-mobile-margin);
        scale: 1.02 1;
        top: 1rem;
    }

    .previous-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.48);
        font-weight: var(--lyric-mobile-font-weight);
        font-size: var(--lyric-mobile-font-size);
        line-height: var(--lyric-mobile-line-height);
        margin: var(--lyric-mobile-margin);
        top: 1rem;
    }

    .after-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.48);
        font-weight: var(--lyric-mobile-font-weight);
        font-size: var(--lyric-mobile-font-size);
        line-height: var(--lyric-mobile-line-height);
        margin: var(--lyric-mobile-margin);
        top: 1rem;
    }

    @media (min-width: 768px) {
        .current-lyric {
            font-size: 3rem;
            line-height: 4rem;
            margin: 2.4rem 0;
        }

        .after-lyric {
            font-size: 3rem;
            line-height: 3.3rem;
            margin: 2.4rem 0;
        }

        .previous-lyric {
            font-size: 3em;
            line-height: 3.3rem;
            margin: 2.4rem 0;
        }
    }

    @media (min-width: 1024px) {
        .current-lyric {
            font-size: var(--lyric-desktop-font-size);
            line-height: var(--lyric-desktop-line-height);
            margin: var(--lyric-desktop-margin);
        }

        .after-lyric {
            font-size: var(--lyric-desktop-font-size);
            line-height: var(--lyric-desktop-line-height);
            margin: var(--lyric-desktop-margin);
        }

        .previous-lyric {
            font-size: var(--lyric-desktop-font-size);
            line-height: var(--lyric-desktop-line-height);
            margin: var(--lyric-desktop-margin);
        }
    }
</style>
