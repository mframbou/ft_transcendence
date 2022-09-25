<script lang="ts">


import  Pong  from '$lib/Pong.svelte'
import Button from '$lib/Button.svelte';
import { onMount } from 'svelte';
import { pongSocketStore } from '$lib/stores';

function setReady()
{
    console.log("CLIENT READY");
		$pongSocketStore.emit('startMatchmaking', '');
}

$pongSocketStore.on('matchFound', (data) => {
		console.log("MATCH FOUND, SENDING CONFIRMATION:", data);
		$pongSocketStore.emit('confirmMatch', '');
});

$pongSocketStore.on('connect', () => {
		ready = true;
});

let ready: boolean = $pongSocketStore.connected;

</script>



<style lang="scss">



</style>

<Pong />
<Button disabled={!ready} on:click={setReady}>Ready</Button>

