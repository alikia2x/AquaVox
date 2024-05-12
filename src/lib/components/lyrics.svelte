<script lang="ts">
    import type { Line } from 'srt-parser-2';
    export let lyrics: string[];
    export let originalLyrics: Line[];
    export let progress: number;
    let currentScrollPos = '';
    let currentLyric: Line;
    let currentLyricIndex = -1;

    let refs = [];
    let _refs: any[] = [];
    $: refs = _refs.filter(Boolean);

    function getClass(lyricIndex: number, progress: number) {
        if (lyricIndex === currentLyricIndex) return 'current-lyric';
        else if (progress > currentLyric.endSeconds) return 'after-lyric';
        else return 'previous-lyric';
    }

    $: {
        if (originalLyrics) {
            let found = false;
            for (let i = 0; i < originalLyrics.length; i++) {
                let l = originalLyrics[i];
                if (progress >= l.startSeconds && progress <= l.endSeconds) {
                    currentLyric = l;
                    currentLyricIndex = i;
                    found = true;
                    const currentRef = refs[i];
                    if (currentRef && currentScrollPos !== currentLyric.text) {
                        currentRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        currentScrollPos = currentLyric.text;
                    }
                    break;
                }
            }
            for (let i = 0; i < lyrics.length; i++) {
                const offset = Math.abs(i - currentLyricIndex);
                const blurRadius = Math.min(offset * 1, 16);
                if (refs[i]) {
                    refs[i].style.filter = `blur(${blurRadius}px)`;
                }
            }
            if (!found) {
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
        text-left scroll-smooth no-scrollbar overflow-y-auto z-[1] lyrics"
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
        mask-image: linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 2rem, rgba(0,0,0,1) calc(100% - 5rem), rgba(0,0,0,0) 100%);
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
        margin: 1rem 0.3rem;
    }
    .previous-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 2.2rem;
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
        font-size: 2.2rem;
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
            font-size: 2.8rem;
            line-height: 3.3rem;
            margin: 2.4rem 0rem;
        }
        .previous-lyric {
            font-size: 2.8rem;
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
