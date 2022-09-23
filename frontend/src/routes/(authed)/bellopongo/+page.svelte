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


</script>



<style lang="scss">



</style>

<Pong />
<Button on:click={setReady}>Ready</Button>

