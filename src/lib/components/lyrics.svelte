<script lang="ts">
    import BezierEasing from 'bezier-easing';
    import type { Line } from 'srt-parser-2';
    export let lyrics: string[];
    export let originalLyrics: Line[];
    export let progress: number;
    function userSlideProgress() {
        systemCouldScrollSince = 0;
    }
    export { userSlideProgress };

    let currentScrollPos = '';
    let currentLyric: Line;
    let currentLyricIndex = -1;
    let lyricsContainer: HTMLDivElement;
    let systemScrolling = false;
    let systemCouldScrollSince = 0;
    let lastScroll = 0;

    let refs = [];
    let _refs: any[] = [];
    $: refs = _refs.filter(Boolean);

    function smoothScrollTo(element: HTMLElement, to: number, duration: number, timingFunction: Function) {
        if (systemCouldScrollSince > Date.now()) return;
        systemScrolling = true;
        const start = element.scrollTop;
        const change = to - start;
        const startTime = performance.now();

        function animateScroll(timestamp: number) {
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = timingFunction(progress, 0.38, 0, 0.24, 0.99);
            element.scrollTop = start + change * easedProgress;

            console.log(elapsedTime);
            if (elapsedTime < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                console.log('!');
                setTimeout(() => {
                    console.log('?');
                    systemScrolling = false;
                }, 100);
            }
        }

        requestAnimationFrame(animateScroll);
    }

    // Define your custom Bézier curve function
    function customBezier(progress: number, p1x: number, p1y: number, p2x: number, p2y: number) {
        function cubicBezier(t: number, p1: number, p2: number) {
            const c = 3 * p1;
            const b = 3 * (p2 - p1) - c;
            const a = 1 - c - b;
            return a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t;
        }

        return BezierEasing(p1x, p1y, p2x, p2y)(progress);
    }

    function getClass(lyricIndex: number, progress: number) {
        if (!currentLyric) return 'after-lyric';
        if (lyricIndex === currentLyricIndex) return 'current-lyric';
        else if (progress > currentLyric.endSeconds) return 'after-lyric';
        else return 'previous-lyric';
    }

    function inRange(x: number, min: number, max: number) {
        return (x - min) * (x - max) <= 0;
    }

    $: {
        if (originalLyrics && lyricsContainer) {
            let found = false;
            let finallyFound = false;
            for (let i = 0; i < originalLyrics.length; i++) {
                let l = originalLyrics[i];
                if (progress >= l.startSeconds && progress <= l.endSeconds) {
                    currentLyric = l;
                    currentLyricIndex = i;
                    found = true;
                    const currentRef = refs[i];
                    if (currentRef && currentScrollPos !== currentLyric.text) {
                        const targetScroll =
                            lyricsContainer.scrollTop +
                            currentRef.getBoundingClientRect().top -
                            lyricsContainer.getBoundingClientRect().height * 0.1 -
                            128;
                        const duration = 450;
                        smoothScrollTo(lyricsContainer, targetScroll, duration, customBezier);
                        lastScroll = 0;
                        currentScrollPos = currentLyric.text;
                    }
                    break;
                }
            }
            if (!found) {
                for (let i = 0; i < originalLyrics.length; i++) {
                    let l = originalLyrics[i];
                    let nl = i + 1 < originalLyrics.length ? originalLyrics[i + 1] : originalLyrics[i];
                    if (
                        progress >= l.endSeconds &&
                        progress < nl.startSeconds &&
                        inRange(lastScroll, l.endSeconds, nl.startSeconds) === false
                    ) {
                        const currentRef = refs[i];
                        const targetScroll = lyricsContainer.scrollTop + currentRef.getBoundingClientRect().top - 320;
                        const duration = 700;
                        currentLyricIndex = i - 0.1;
                        currentLyric = {
                            id: '-1',
                            startTime: '00:00:00,000',
                            startSeconds: l.endSeconds + 0.01,
                            endTime: '00:00:00,000',
                            endSeconds: nl.startSeconds - 0.01,
                            text: ''
                        };
                        smoothScrollTo(lyricsContainer, targetScroll, duration, customBezier);
                        lastScroll = progress;
                        finallyFound = true;
                        break;
                    }
                }
            }
            if (systemCouldScrollSince < Date.now()) {
                for (let i = 0; i < lyrics.length; i++) {
                    const offset = Math.abs(i - currentLyricIndex);
                    const blurRadius = Math.min(offset * 1, 16);
                    if (refs[i]) {
                        refs[i].style.filter = `blur(${blurRadius}px)`;
                    }
                }
            }
            if (found == false && finallyFound == false) {
                currentLyric = {
                    id: '-1',
                    startTime: '00:00:00,000',
                    startSeconds: 0,
                    endTime: '00:00:00,000',
                    endSeconds: 0,
                    text: ''
                };
            }
        }
    }
</script>

{#if lyrics && originalLyrics}
    <div
        class="absolute top-[6.5rem] md:top-36 xl:top-0 w-screen xl:w-[52vw] px-6 md:px-12 lg:px-[7.5rem] xl:left-[45vw] xl:px-[3vw] h-[calc(100vh-17rem)] xl:h-screen font-sans
        text-left no-scrollbar overflow-y-auto z-[1] lyrics py-16"
        bind:this={lyricsContainer}
        on:scroll={(e) => {
            if (systemScrolling == false) {
                console.log('yes');
                for (let i = 0; i < lyrics.length; i++) {
                    refs[i].style.filter = `blur(0px)`;
                }
                systemCouldScrollSince = Date.now() + 5000;
            }
        }}
    >
        {#each lyrics as lyric, i}
            <p bind:this={_refs[i]} class={getClass(i, progress)}>
                {lyric}
            </p>
        {/each}
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
        scrollbar-width: none;
    }
    .no-scrollbar::-webkit-scrollbar {
        width: 0;
    }
    .current-lyric {
        position: relative;
        color: white;
        font-weight: 600;
        font-size: 2.3rem;
        line-height: 2.7rem;
        top: 1rem;
        transition: 0.2s;
        margin: 1rem 0rem;
    }
    .previous-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 2.3rem;
        line-height: 2.7rem;
        filter: blur(1px);
        top: 1rem;
        transition: 0.2s;
        margin: 1rem 0rem;
    }
    .after-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 2.3rem;
        line-height: 2.7rem;
        filter: blur(1px);
        top: 1rem;
        transition: 0.2s;
        margin: 1rem 0rem;
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
            line-height: 4.5rem;
            margin: 2rem 0rem;
        }
        .after-lyric {
            font-size: 3rem;
            line-height: 3.5rem;
            margin: 2rem 0rem;
        }
        .previous-lyric {
            font-size: 3rem;
            line-height: 3.5rem;
            margin: 2rem 0rem;
        }
    }
</style>
