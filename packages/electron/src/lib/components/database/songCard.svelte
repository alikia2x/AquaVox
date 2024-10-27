<script lang="ts">
    import formatDuration from "$lib/utils/formatDuration";
    import { formatViews } from "$lib/utils/formatViews";

    export let songData: MusicMetadata;
</script>

<div>
    <div
        class="relative w-56 h-56 bg-zinc-300 dark:bg-zinc-600 rounded-lg overflow-hidden
shadow-lg cursor-pointer justify-self-center"
        
    >
        <div
            class="absolute top-0 left-0 w-full h-full duration-100
z-10 opacity-0 hover:opacity-100 bg-[rgba(0,0,0,0.15)]"
        >
            <a href={songData.url} class="absolute z-10 h-full w-full">

            </a>
            <a
                class="brightness-125 absolute top-2 right-2 w-8 h-8 rounded-full
        bg-[rgba(49,49,49,0.7)] backdrop-blur-lg z-30 hover:bg-red-500"
                href={`/database/edit/${songData.id}`}
            >
                <img class="relative w-4 h-4 top-2 left-2 scale-90" src="/edit.svg" alt="编辑" />
            </a>
        </div>
        <img src={songData.coverURL[0]} class="w-56 h-56" alt="" />
        <div
            class="absolute bottom-0 w-full h-28 backdrop-blur-xl"
            style="mask-image: linear-gradient(to top, black 50%, transparent);"
        >
            <div class="absolute bottom-0 w-full h-16 pl-2">
                <span
                    class="font-semibold text-2xl text-white"
                    style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);">{songData.name}</span
                >
                <br />
                <span
                    class="relative inline-block whitespace-nowrap text-white w-28
            overflow-hidden text-ellipsis"
                    style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);"
                >
                    {songData.producer}
                </span>
                <div
                    class="absolute right-2 bottom-2 text-right text-white"
                    style="text-shadow: 0px 0px 4px rgba(65, 65, 65, .6);"
                >
                    {#if songData.duration}
                        <span>{formatDuration(songData.duration)}</span>
                    {/if}
                    <br />
                    {#if songData.views}
                        <span>{formatViews(songData.views)}播放</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>