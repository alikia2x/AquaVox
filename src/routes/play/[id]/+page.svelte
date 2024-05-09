<script lang="ts">
    import { page } from '$app/stores';
    import Background from '$lib/components/background.svelte';
    import Cover from '$lib/components/cover.svelte';

    const audioId = $page.params.id;
</script>

<Background coverId={audioId} />
<Cover coverId={audioId}/>