<script lang="ts">


	import  Pong  from '$lib/Pong.svelte'
	import Button from '$lib/Button.svelte';
	import { pongSocket, pongSocketConnected } from '$lib/websocket-stores';

	function setReady()
	{
		console.log("CLIENT READY");
		$pongSocket.emit('startMatchmaking', '');

		$pongSocket.once('matchFound', (data) => {
			console.log("MATCH FOUND, SENDING CONFIRMATION:", data);
			$pongSocket.emit('confirmMatch', '');
		});
	}

	let currentMode : 'SINGLEPLAYER' | 'MULTIPLAYER' | 'SPECTATOR' = 'SINGLEPLAYER';

</script>



<style lang="scss">



</style>

<Pong bind:currentMode />
<Button disabled={currentMode === 'MULTIPLAYER' || !$pongSocketConnected} on:click={setReady}>Ready</Button>

