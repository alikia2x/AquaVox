<script lang="ts">
    import { page } from '$app/stores';
    import { getCurrentFormattedDateTime } from '$lib/songUpdateTime';
    let templateSongData: MusicMetadata = {
        id: '',
        name: '',
        url: '',
        singer: [],
        producer: '',
        tuning: [],
        lyricist: [],
        composer: [],
        arranger: [],
        mixing: [],
        pv: [],
        illustrator: [],
        harmony: [],
        instruments: [],
        songURL: [],
        coverURL: [],
        duration: null,
        views: null,
        publishTime: null,
        updateTime: getCurrentFormattedDateTime(),
        lyric: null
    };
    let editingData: string = JSON.stringify(templateSongData, null, 8);

    async function submit() {
        fetch(`/api/database/song/${templateSongData.id}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: editingData
        }).catch((error) => {
            console.log(error);
            return [];
        });
    }
</script>

<svelte:head>
    <title>提交新曲</title>
</svelte:head>

<h1>提交新曲</h1>

<textarea bind:value={editingData} class="dark:bg-zinc-600 w-full min-h-[36rem] mt-6" />

<button
    class="mt-4 mb-32 h-12 w-24 border-black dark:border-white border-2 flex items-center justify-center rounded-lg"
    on:click={() => {
        submit();
    }}>提交</button
>
