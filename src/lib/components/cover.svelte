<script lang="ts">
    import localforage from '$lib/storage';
    import type { Writable } from 'svelte/store';
    export let coverPath: Writable<string>;
    let path: string = '';

    coverPath.subscribe((p) => {
        if (p) path = p;
    });
</script>

<img class="cover" src={path} alt="封面" />

<style>
    .cover {
        user-select: none;
        position: absolute;
        z-index: 1;
        width: 55vh;
        min-width: 27vw;
        min-height: 27vw;
        object-fit: cover;
        left: 10vw;
        top: 40vh;
        transform: translate(0, -50%);
        border-radius: 1rem;
        box-shadow: 0 0 1rem 0.5rem rgba(0, 0, 0, 0.1);
    }
</style>
