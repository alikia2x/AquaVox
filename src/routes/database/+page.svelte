<script lang="ts">
    import formatDuration from '$lib/formatDuration';
    import { formatViews } from '$lib/formatViews';
    import { onMount } from 'svelte';
    let songList: MusicMetadata[] = [];

    onMount(async () => {
        fetch('/api/database/songs')
            .then((response) => response.json())
            .then((data) => {
                songList = data;
            })
            .catch((error) => {
                console.log(error);
                return [];
            });
    });
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

    <div class="grid mb-32" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
            justify-content: space-between;
            gap: 2rem 1rem;">
        {#each songList as song}
            <a
                class="relative w-56 h-56 bg-zinc-300 dark:bg-zinc-600 rounded-lg overflow-hidden
            shadow-lg cursor-pointer justify-self-center"
                href={song.url}
            >
                <div
                    class="absolute top-0 left-0 w-full h-full duration-100
                z-10 opacity-0 hover:opacity-100 bg-[rgba(0,0,0,0.15)]"
                >
                    <a
                        class="brightness-125 absolute top-2 right-2 w-8 h-8 rounded-full 
                        bg-[rgba(49,49,49,0.7)] backdrop-blur-lg z-10 hover:bg-red-500"
                        href={`/database/edit/${song.id}`}
                    >
                        <img class="relative w-4 h-4 top-2 left-2 scale-90" src="/edit.svg" alt="编辑" />
                    </a>
                </div>
                <img src={song.coverURL[0]} class="w-56 h-56" alt="" />
                <div
                    class="absolute bottom-0 w-full h-28 backdrop-blur-xl"
                    style="mask-image: linear-gradient(to top, black 50%, transparent);"
                >
                    <div class="absolute bottom-0 w-full h-16 pl-2">
                        <span
                            class="font-semibold text-2xl text-white"
                            style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);">{song.name}</span
                        >
                        <br />
                        <span
                            class="relative inline-block whitespace-nowrap text-white w-40
                            overflow-hidden text-ellipsis"
                            style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);"
                        >
                            {song.singer.join(', ')}
                        </span>
                        <div class="absolute right-2 bottom-2 text-right text-white" style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);">
                            {#if song.duration}
                                <span>{formatDuration(song.duration)}</span>
                            {/if}
                            <br />
                            {#if song.views}
                                <span>{formatViews(song.views)}播放</span>
                            {/if}
                        </div>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>
