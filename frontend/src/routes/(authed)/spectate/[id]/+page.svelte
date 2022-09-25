<script lang="ts">
	import Pong from '$lib/Pong.svelte';
	import { pongSocketStore } from '$lib/stores';
	import { onMount } from 'svelte';

	export let data;

	const gameRoom = data.room;

	onMount(() => {
		$pongSocketStore.on('connect', () => {
			$pongSocketStore.emit('startSpectate', { roomId: gameRoom.id });
		});

		if ($pongSocketStore.connected)
			$pongSocketStore.emit('startSpectate', { roomId: gameRoom.id });
	});


</script>

<style lang="scss">

</style>

{JSON.stringify(gameRoom)}
<Pong spectateId={gameRoom.id}/>
