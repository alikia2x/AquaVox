<script lang="ts">
    import localforage from "$lib/storage";
    let musicList;

    function extractId(key: string) {
        return key.split('-').pop();
    }
    localforage.iterate(function (value, key, iterationNumber) {
        console.log(extractId(key));
    })
</script>

<div
    class="absolute w-screen md:w-2/3 left-0 md:left-[16.6667%] px-[3%] md:px-0 top-16"
>
    <h1>AquaVox</h1>
    <h2>音乐库</h2>
</div>
