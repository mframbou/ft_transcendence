<script lang="ts">
	import Pong from '$lib/Pong.svelte';
	import { pongSocket } from '$lib/websocket-stores';
	import { onMount } from 'svelte';

	export let data;

	const gameRoom = data.room;

	onMount(async () => {

		$pongSocket.on('connect', () => {
			$pongSocket.emit('startSpectate', { roomId: gameRoom.id });
		});

		$pongSocket.on('disconnect', () => {
			console.log('disconnected');
			// try to reconnect
			$pongSocket.connect();
		});

		if ($pongSocket.connected)
			$pongSocket.emit('startSpectate', { roomId: gameRoom.id });
	});


</script>

<style lang="scss">

</style>

<Pong spectateId={gameRoom.id}/>
