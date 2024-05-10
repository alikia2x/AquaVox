<script lang="ts">
    import { page } from '$app/stores';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';
    import InteractiveBox from '$lib/components/interactiveBox.svelte';

    const audioId = $page.params.id;
    const name = "晨曦旅客";
    const singer = "乐正绫";
    const duration = 218;
    const currentProgress = 0;
</script>

<Background coverId={audioId} />
<Cover coverId={audioId} />
<InteractiveBox name={name} singer={singer} duration={duration} progress={currentProgress}/>
