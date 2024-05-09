<script lang="ts">
    import localforage from '$lib/storage';
    import { page } from '$app/stores';
    export let coverId;

    let coverPath = '';

    localforage.getItem(`${coverId}-cover`, function (err, file) {
        if (file) {
            const path = URL.createObjectURL(file as File);
            coverPath = path;
        }
    });
</script>

<img class="cover" src={coverPath} alt="封面" />

<style>
    .cover {
        position: absolute;
        z-index: 1;
        min-height: 35vh;
        max-height: 55vh;
        width: 34vw;
        object-fit: cover;
        left: 10vw;
        top: 40vh;
        transform: translate(0, -50%);
        border-radius: 1rem;
        box-shadow: 0 0 1rem 0.5rem rgba(0, 0, 0, 0.1);
    }
</style>
