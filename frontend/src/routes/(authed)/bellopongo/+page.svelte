<script lang="ts">


import  Pong  from '$lib/Pong.svelte'
import Button from '$lib/Button.svelte';
import { onMount } from 'svelte';
import { pongSocketStore } from '$lib/stores';

function setReady()
{
    console.log("CLIENT READY");
		$pongSocketStore.emit('onStartMatchmaking', '');
}

$pongSocketStore.on('onMatchFound', (data) => {
		console.log("MATCH FOUND, SENDING CONFIRMATION:", data);
		$pongSocketStore.emit('onConfirmMatch', '');
});

let isPlayer1 = true;

$pongSocketStore.on('onStartGame', (data) => {
		console.log("STARTING GAME:", data);
		isPlayer1 = data.isPlayer1;
});

</script>



<style lang="scss">



</style>

<Pong isPlayerOne={isPlayer1} />
<Button on:click={setReady}>Ready</Button>

