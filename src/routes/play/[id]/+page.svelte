<script lang="ts">
    import { page } from '$app/stores';
    import Background from '../../../components/background.svelte';

    const audioId = $page.params.id;

</script>

<Background coverId={audioId} />
