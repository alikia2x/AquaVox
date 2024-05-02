<script lang="ts">
    import { onMount } from 'svelte';
    import localforage from 'localforage';
    import Background from '../components/background.svelte';
    let audioInput: any;
    let coverInput: any;
    const audioId = 'd5a2e306-ddea-4fc3-9927-c79dcb3a4071';

    // Initialize IndexedDB
    localforage.config({
        driver: localforage.INDEXEDDB,
        name: 'audioDB'
    });
    onMount(() => {
        // Handle audio input change
        audioInput.addEventListener('change', function (e: any) {
            const file: File = e.target.files[0];
            if (file) {
                localforage.setItem(audioId + '-file', file);
            }
        });

        coverInput.addEventListener('change', function (e: any) {
            const file = e.target.files[0];
            if (file) {
                localforage.setItem(audioId + '-cover', file);
            }
        });
        return () => {
            ;
        };
    });
</script>

<p>
    Select Audio File:
    <input type="file" bind:this={audioInput} />
</p>
<p>
    Select Cover File:
    <input type="file" bind:this={coverInput} />
</p>
<input
    type="text"
    placeholder="Input song id"
    id="audioId"
    value="d5a2e306-ddea-4fc3-9927-c79dcb3a4071"
    style="width: 36ch"
/>

<Background coverId={audioId} />