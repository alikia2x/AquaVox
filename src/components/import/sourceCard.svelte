<script lang="ts">
    export let title: string;
    export let icon: string;
    export let details: string;
    import Icon from '@iconify/svelte';
</script>

<div class="flex relative min-h-20 h-fit p-4 w-full m-4 border-2 border-zinc-400 dark:border-neutral-700 rounded-lg">
    <div class="flex flex-col justify-center text-4xl">
        <Icon icon={icon} />
    </div>
    
    <div class="ml-4 flex flex-col justify-center">
        <h3 class="text-lg font-semibold">{title}</h3>
        <p>{details}</p>
    </div>
</div>