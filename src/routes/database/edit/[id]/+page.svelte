<script lang="ts">
    /** @type {import('./$types').PageData} */
	export let data;
    import { page } from '$app/stores';
    const songID = $page.params.id;
    let editingData: string = JSON.stringify(data.songData, null, 8);

    async function submit() {
        fetch(`/api/database/song/${songID}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: editingData
        })
            .catch((error) => {
                console.log(error);
                return [];
            });
    }
</script>

<svelte:head>
    <title>建议编辑： {data.songData.name} ({songID})</title>
</svelte:head>

<h1>建议编辑： {data.songData.name} ({songID})</h1>

<textarea bind:value={editingData} class="dark:bg-zinc-600 w-full min-h-[30rem] mt-6" />

<button
    class="mt-4 mb-32 h-12 w-24 border-black dark:border-white border-2 flex items-center justify-center rounded-lg"
    on:click={() => {
        submit();
    }}>提交</button
>