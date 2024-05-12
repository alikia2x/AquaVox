<script lang="ts">
    import extractFileName from '$lib/extractFileName';
    import toHumanSize from '$lib/humanSize';
    import localforage from '$lib/storage';
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
        console.log(musicList);
    });
</script>

<div class="absolute w-screen md:w-2/3 lg:w-1/2 left-0 md:left-[16.6667%] lg:left-1/4 px-[3%] md:px-0 top-16">
    <h1>AquaVox</h1>
    <h2>音乐库</h2>
    <div>
        <ul
            class="mt-4 relative w-full"
        >
            {#each idList as id}
                <a href={`/play/${id}`}>
                    <li class="relative my-4 p-4 bg-zinc-300 dark:bg-zinc-600 rounded-lg">
                        <span>{musicList[id].name}</span> <br />
                        <span>{toHumanSize(musicList[id].size)}</span>
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
</div>
