<script lang="ts">

	import { gameRooms} from '$lib/stores';

</script>

{#if $gameRooms}
	{#each $gameRooms as room}
		{JSON.stringify(room)}
	{/each}

	{#if $gameRooms.length === 0}
		No gamerooms
	{/if}
{/if}

