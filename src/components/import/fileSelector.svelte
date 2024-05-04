<script lang="ts">
    export let audioFiles: HTMLInputElement;
    import ImportIcon from './importIcon.svelte';
    import { onMount } from 'svelte';
    import { useAtom } from 'jotai-svelte';
    import { fileListState } from '$lib/state/fileList.state';
    import AddIcon from './addIcon.svelte';
    const fileItems = useAtom(fileListState);

    onMount(() => {
        audioFiles.addEventListener('change', function (e: any) {
            if (audioFiles.files) {
                fileItems.update((prev) => {
                    if (audioFiles.files) {
                        return [...prev, ...Array.from(audioFiles.files)];
                    } else {
                        return prev;
                    }
                });
            }
        });
        return () => {};
    });
</script>

<input style="display: none;" type="file" bind:this={audioFiles} multiple accept="audio/*" />
<div class={$$props.class}>
    <button
        on:click={() => {
            audioFiles.click();
        }}
    >
        <div>
            {#if $fileItems.length > 0}
                <AddIcon class="z-[1] relative text-3xl" />
            {:else}
                <ImportIcon class="z-[1] relative text-4xl" />
            {/if}
        </div>
    </button>
</div>
