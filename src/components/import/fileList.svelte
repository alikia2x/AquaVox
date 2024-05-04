<script lang="ts">
    import { useAtom } from 'jotai-svelte';
    import { fileListState, finalFileListState } from '$lib/state/fileList.state';
    import toHumanSize from '$lib/humanSize';
    import audioFormatText from '$lib/audioFormatText';
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
    {#each $finalItems as item}
        <li class="relative m-4 p-4 bg-zinc-300 dark:bg-zinc-600 rounded-lg">
            <span>{extractFileName(item.name)}</span> <br />
            <span>{toHumanSize(item.size)}</span> · <span>{audioFormatText(item.type)}</span> ·  <span>{item.duration ? formatDuration(item.duration) : 'N/A'}</span>
            {#if item.pic !== 'N/A'}
                <img class="h-16 w-16 object-cover absolute rounded-lg right-2 top-2" src={item.pic} alt="" />
            {/if}
        </li>
    {/each}
</ul>
