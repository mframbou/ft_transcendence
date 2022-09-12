<script lang="ts">


import  Pong  from '$lib/Pong.svelte'
import Button from '$lib/Button.svelte';
import { onMount } from 'svelte';
import { pongSocketStore } from '$lib/stores';

function setReady()
{
    console.log("CLIENT READY");

		$pongSocketStore.emit('onGameReady', '');
}


</script>



<style lang="scss">



</style>

<Pong />
<Button on:click={setReady}>Ready</Button>

