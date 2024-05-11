<script lang="ts">
    export let lyrics: string[] = [];
    export let progress: number;
</script>

<div class="lyrics" style="overflow-y: auto">
    {#each lyrics as lyric}
        <p class="current-lyric">{lyric}</p>
    {/each}
</div>

<style>
    .lyrics {
        position: absolute;
        width: 45vw;
        left: 50vw;
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
