<script lang="ts">
    import SongCard from '@core/components/database/songCard.svelte';
    import { type MusicMetadata } from '@core/server/database/musicInfo';
    import type { PageServerData } from './$types';
    export let data: PageServerData;
    let songList: MusicMetadata[] = data.songDataList;
</script>

<svelte:head>
    <title>AquaVox 音乐数据库</title>
</svelte:head>

<h1 class="text-3xl text-red-500"><a href="/">AquaVox</a></h1>

<div>
    <div class="flex justify-between items-center h-20 mb-8">
        <h1>AquaVox 音乐数据库</h1>
        <a
            href="/database/submit"
            class="h-12 w-24 border-black dark:border-white border-2 flex items-center justify-center rounded-lg"
            >提交新曲</a
        >
    </div>

    <div
        class="relative grid mb-32"
        style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            justify-content: space-between;
            gap: 2rem 1rem;"
    >
        {#each songList as song}
            <SongCard songData={song}/>
        {/each}
    </div>
</div>
