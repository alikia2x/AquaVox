<script lang="ts">
    import SourceCard from "$lib/components/import/sourceCard.svelte";

</script>

<h1 class="text-3xl text-red-500"><a href="/">AquaVox</a></h1>
<h1>导入</h1>
<p class="leading-10">希望从哪里导入你的歌曲？</p>
<SourceCard title="本地" dest="/import/local" details="从本地导入歌曲添加到 AquaVox 的本地音乐库。
音乐文件将保存在浏览器中，因此无法跨浏览器聆听。若希望能在多个设备或浏览器上聆听，请考虑跨设备同步功能。" icon="uil:import" />
<SourceCard title="哔哩哔哩" dest="/import/bilibili" details="通过导入哔哩哔哩的公开收藏夹或若干给定BV号的视频，你可以将自己在哔哩哔哩中喜爱的歌曲导入到 AquaVox。
但需要注意，此选项的可用性无法保证。" icon="ri:bilibili-fill" />