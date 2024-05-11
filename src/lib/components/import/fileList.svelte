<script lang="ts">
    import { useAtom } from 'jotai-svelte';
    import { fileListState, finalFileListState } from '$lib/state/fileList.state';
    import toHumanSize from '$lib/humanSize';
    import formatText from '$lib/formatText';
    import extractFileName from '$lib/extractFileName';
    import getAudioMeta from '$lib/getAudioCoverURL';
    import convertCoverData from '$lib/convertCoverData';
    import type { IAudioMetadata } from 'music-metadata-browser';
    import formatDuration from '$lib/formatDuration';
    const items = useAtom(fileListState);
    const finalItems = useAtom(finalFileListState);

    $: {
        const length = $items.length;
        for (let i = 0; i < length; i++) {
            if ($items[i].type.indexOf('audio') === -1) continue;
            if ($items[i].pic || $items[i].pic === 'N/A') continue;
            getAudioMeta($items[i], (metadata: IAudioMetadata) => {
                let cover: string | null = null;
                let duration: number | null = null;
                if (metadata.common.picture)
                    cover = convertCoverData(metadata.common.picture[0]);
                if (metadata.format.duration)
                    duration = metadata.format.duration;
                finalItems.update((prev) => {
                    if (cover) {
                        let currentItem = [];
                        currentItem = $items[i];
                        currentItem.pic = cover;
                        currentItem.duration = duration;
                        return [...prev, currentItem];
                    } else {
                        let currentItem = [];
                        currentItem = $items[i];
                        currentItem.pic = 'N/A';
                        currentItem.duration = duration;
                        return [...prev, currentItem];
                    }
                });
            });
        }
    }
</script>

<ul
    class="mt-4 relative w-full min-h-48 max-h-[27rem] overflow-y-auto bg-zinc-200 dark:bg-zinc-800 rounded"
>
    {#each $items as item}
        <li class="relative m-4 p-4 bg-zinc-300 dark:bg-zinc-600 rounded-lg">
            <span>{extractFileName(item.name)}</span> <br />
            <span>{toHumanSize(item.size)}</span>
            {#if item.type}
            · <span>{formatText(item.type)}</span>
            {:else if item.name.split(".").length > 1}
            · <span>{formatText(item.name.split(".")[item.name.split(".").length-1])}</span>
            {:else}
            · <span>未知格式</span>
            {/if}
            {#if item.duration}
            · <span>{formatDuration(item.duration)}</span>
            {/if}
            {#if item.pic!==undefined && item.pic !== 'N/A'}
                <img class="h-16 w-16 object-cover absolute rounded-lg right-2 top-2" src={item.pic} alt="" />
            {/if}
        </li>
    {/each}
</ul>
