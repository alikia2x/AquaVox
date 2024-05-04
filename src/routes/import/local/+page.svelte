<script>
    import FileList from '../../../components/import/fileList.svelte';
    import FileSelector from '../../../components/import/fileSelector.svelte';
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

<FileList/>
