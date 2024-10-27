<script>
    import { page } from '$app/stores';
    import FileList from '@core/components/import/fileList.svelte';
    import FileSelector from '@core/components/import/fileSelector.svelte';
    import localforage from '$lib/utils/storage';
    import { fileListState } from '$lib/state/fileList.state';
    import { useAtom } from 'jotai-svelte';
    const fileList = useAtom(fileListState);
    const audioId = $page.params.id;
    let status = "";
</script>

<h1 class="text-3xl text-red-500"><a href="/">AquaVox</a></h1>
<h1>歌词导入</h1>
<p>当前为 <span class="text-zinc-700 dark:text-zinc-400">{audioId}</span> 导入歌词</p>

<div class="w-full flex my-3">
    <h2>歌词文件</h2>
    <FileSelector accept=".lrc, .ttml" class="ml-auto top-2 relative" />
</div>

<FileList />

<p class="mt-4">
    {status}
</p>
<button
    class="mt-1 bg-blue-500 hover:bg-blue-600 duration-200 text-white font-bold py-2 px-5 rounded"
    on:click={() => {
        for (let file of $fileList) {
            localforage.setItem(audioId + '-lyric', file, function (err) {
                if (err) {
                    status = "歌词导入失败";
                } else {
                    status = "已经导入。";
                }
            });
        }
    }}
>
    导入
</button>
