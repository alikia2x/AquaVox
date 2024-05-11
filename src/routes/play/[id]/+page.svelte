<script lang="ts">
    import { page } from '$app/stores';
    import getAudioIDMetadata from '$lib/audio/getAudioIDMetadata';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';
    import InteractiveBox from '$lib/components/interactiveBox.svelte';
    import extractFileName from '$lib/extractFileName';
    import localforage from 'localforage';

    const audioId = $page.params.id;
    let name = "";
    let singer = "";
    let duration = 0;
    let currentProgress = 0;

    localforage.getItem(`${audioId}-file`, function (err, file) {
        if (file) {
            const f = file as File;
            name = extractFileName(f.name);
        }
    });
    getAudioIDMetadata(audioId, (metadata: any) => {
        console.log(metadata);
        duration = metadata.format.duration ? metadata.format.duration : 0;
    })
</script>

<Background coverId={audioId} />
<Cover coverId={audioId} />
<InteractiveBox name={name} singer={singer} duration={duration} progress={currentProgress}/>
