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
                const fontSize = i === currentLyricIndex ? '3.5rem' : '3rem';
                const lineHeight = i === currentLyricIndex ? '4.5rem' : '4rem';
                if (refs[i]) {
                    refs[i].style.filter = `blur(${blurRadius}px)`;
                    refs[i].style.fontSize = fontSize;
                    refs[i].style.lineHeight = lineHeight;
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
    <div class="lyrics" style="overflow-y: auto">
        {#each lyrics as lyric, i}
            <p bind:this={_refs[i]} class={getClass(i, progress)}>
                {lyric}
            </p>
        {/each}
    </div>
{/if}

<style>
    .lyrics {
        position: absolute;
        width: 52vw;
        left: 45vw;
        padding-left: 3vw;
        padding-right: 3vw;
        height: 100vh;
        font-family: sans-serif;
        text-align: left;
        scroll-behavior: smooth;
        scrollbar-width: none;
    }
    ::-webkit-scrollbar {
        width: 0;
    }
    .current-lyric {
        position: relative;
        color: white;
        font-weight: 600;
        font-size: 3.5rem;
        line-height: 4.5rem;
        top: 1rem;
        transition: 0.2s;
        margin: 2rem 0.3rem;
    }
    .previous-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 3rem;
        line-height: 3.5rem;
        filter: blur(1px);
        top: 1rem;
        transition: 0.2s;
        margin: 2rem 0rem;
    }
    .after-lyric {
        position: relative;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 600;
        font-size: 3rem;
        line-height: 3.5rem;
        filter: blur(1px);
        top: 1rem;
        transition: 0.2s;
        margin: 2rem 0rem;
    }
</style>
