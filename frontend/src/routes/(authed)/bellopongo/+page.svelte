<script lang="ts">


import  Pong  from '$lib/Pong.svelte'
import { pongSocket } from '$lib/socket-io';
import Button from '$lib/Button.svelte';

function setReady()
{
    console.log("CLIENT READY");
    pongSocket.emit('onGameReady');
}


</script>



<style lang="scss">



</style>

<Pong />
<Button on:click={setReady}>Ready</Button>

