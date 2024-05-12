<script lang="ts">
    export let title: string;
    export let icon: string;
    export let details: string;
    export let dest: string;
    import Icon from '@iconify/svelte';
</script>

<a href={dest}>
    <div
        class="cursor-pointer flex relative min-h-20 h-fit p-4 w-full my-4 lg:m-4 border-2 border-zinc-400 dark:border-neutral-700 rounded-lg"
    >
        <div class="flex flex-col justify-center text-4xl">
            <Icon {icon} />
        </div>

        <div class="ml-4 flex flex-col justify-center">
            <h3 class="text-lg font-semibold">{title}</h3>
            <p>{details}</p>
        </div>
    </div>
</a>
