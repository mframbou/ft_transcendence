<script lang="ts">
	import Pong from '$lib/Pong.svelte';
	import { pongSocket, pongSocketConnected } from '$lib/websocket-stores';

	export let data;

	const gameRoom = data.room;

	$: if($pongSocketConnected)
	{
		$pongSocket.emit('startSpectate', { roomId: gameRoom.id });
	}

</script>

<style lang="scss">

</style>

<Pong spectateId={gameRoom.id}/>
