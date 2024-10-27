<script lang="ts">
    import extractFileName from '@core/utils/extractFileName';
    import getVersion from '@core/utils/getVersion';
    import toHumanSize from '@core/utils/humanSize';
    import localforage from '@core/utils/storage';
    interface Song {
        name: string;
        singer?: string;
        coverUrl?: string;
        size?: number;
    }
    interface SongList {
        [key: string]: Song;
    }
    let musicList: SongList = {};
    let idList: string[] = [];

    function extractId(key: string) {
        const addons = ['-cover-cache', '-file', '-lyric', '-metadata', '-cover'];
        let r = key;
        for (const addon of addons) {
            if (r.endsWith(addon)) {
                return [r.substring(0, r.length - addon.length), addon.replace(/-/g, ' ').trim()];
            }
        }
        return [r, ''];
    }
    localforage.iterate(function (value: File | Blob | any, key, iterationNumber) {
        const [id, type] = extractId(key);
        if (!type) return;
        if (!musicList[id]) musicList[id] = { name: '' };
        if (type === 'file') {
            const v = value as File;
            musicList[id].name = extractFileName(v.name);
            musicList[id].size = v.size;
        } else if (type === 'cover') {
            const v = value as Blob;
            musicList[id].coverUrl = URL.createObjectURL(v);
        }
        idList = Object.keys(musicList);
    });

    function clear() {
        localforage.clear();
        window.location.reload();
    }
</script>

<svelte:head>
    <title>Aquavox - 音乐库</title>
</svelte:head>

<div
    class="absolute w-screen md:w-2/3 lg:w-1/2 left-0 md:left-[16.6667%] lg:left-1/4 px-[3%] md:px-0 top-16"
>
    <h1>AquaVox</h1>
    <h2>音乐库</h2>
    <div>
        <ul class="mt-4 relative w-full">
            {#each idList as id}
                <a class="!no-underline !text-black dark:!text-white" href={`/play/${id}`}>
                    <li
                        class="relative my-4 p-4 duration-150 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-lg"
                    >
                        <span class="font-bold">{musicList[id].name}</span> <br />
                        <span>{toHumanSize(musicList[id].size)}</span> ·
                        <a class="!no-underline" href={`/import/${id}/lyric`}>导入歌词</a>
                        {#if musicList[id].coverUrl}
                            <img
                                class="h-16 w-16 object-cover absolute rounded-lg right-2 top-2"
                                src={musicList[id].coverUrl}
                                alt=""
                            />
                        {/if}
                    </li>
                </a>
            {/each}
        </ul>
    </div>
    <p>
        AquaVox {getVersion()} · 早期公开预览 · 源代码参见
        <a href="https://github.com/alikia2x/aquavox">GitHub</a>
    </p>
    <a href="/import">导入音乐</a> <br />
    <button
        on:click={() => window.confirm('确定要删除本地数据库中所有内容吗？') && clear()}
        class="text-white bg-red-500 px-4 py-2 mt-4 rounded-md">一键清除</button
    >
    <h2 class="mt-4"><a href="/database/">音乐数据库</a></h2>
    <p>你可以在这里探索，提交和分享好听的歌曲。</p>
</div>

<style lang="postcss">
    a {
        @apply text-red-500 hover:text-red-400 duration-150 underline;
    }
</style>
