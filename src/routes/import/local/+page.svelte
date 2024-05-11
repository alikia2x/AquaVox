<script>
    import FileList from '$lib/components/import/fileList.svelte';
    import FileSelector from '$lib/components/import/fileSelector.svelte';
    import { fileListState, finalFileListState } from '$lib/state/fileList.state';
    import { localImportFailed, localImportSuccess } from '$lib/state/localImportStatus.state';
    import { useAtom } from 'jotai-svelte';
    import localforage from '$lib/storage';
    import { v1 as uuidv1 } from 'uuid';
    const fileList = useAtom(fileListState);
    const finalFiles = useAtom(finalFileListState);
    const failed = useAtom(localImportFailed);
    const success = useAtom(localImportSuccess);
</script>

<h1>本地导入向导</h1>
<p>欢迎使用本地导入向导！</p>
<p>
    你可以选择从本地导入你喜欢的音乐文件，并同时将封面、歌词、歌手与制作者等其他信息一并囊括其中。
</p>

<div class="w-full flex my-3">
    <h2>音频</h2>
    <FileSelector class="ml-auto top-2 relative" />
</div>

<FileList />

<p class="mt-4">
    <span>待处理 {$fileList.length} 个文件</span>
    {#if $success.length > 0}
        <span class="mt-4">{$success.length} 个文件导入成功</span>
    {/if}
    {#if $failed.length > 0}
        <span class="mt-4">{$failed.length} 个文件导入失败</span>
    {/if}
</p>
<button
    class="mt-1 bg-blue-500 hover:bg-blue-600 duration-200 text-white font-bold py-2 px-5 rounded"
    on:click={() => {
        for (let file of $fileList) {
            let audioId = uuidv1();
            localforage.setItem(audioId + '-file', file, function (err) {
                if (err) {
                    failed.update((prev) => [...prev, file]);
                } else {
                    if (file.cover === 'N/A') {
                        success.update((prev) => [...prev, file]);
                        finalFiles.update((prev) => {
                            return prev.filter((item) => item !== file);
                        });
                        fileList.update((prev) => {
                            return prev.filter((item) => item !== file);
                        });
                        return;
                    }
                    let blob = fetch(file.pic).then((r) => {
                        localforage.setItem(audioId + '-cover', r.blob(), function (err) {
                            if (err) {
                                failed.update((prev) => [...prev, file]);
                            } else {
                                success.update((prev) => [...prev, file]);
                                finalFiles.update((prev) => {
                                    return prev.filter((item) => item !== file);
                                });
                                fileList.update((prev) => {
                                    return prev.filter((item) => item !== file);
                                });
                            }
                        });
                    });
                }
            });
        }
    }}
>
    导入
</button>
