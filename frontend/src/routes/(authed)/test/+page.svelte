<script lang="ts">

	import { statusSocket, statusSocketConnected } from '$lib/websocket-stores';
	import { onMount } from 'svelte';

	statusSocketConnected.subscribe((connected) => {
		if (connected) {
			initWebsocket();
		}
	});

	function initWebsocket() {
		const socket = $statusSocket;
		socket.emit('test', {test: true, pouet: false});
	}

</script>

{#if $statusSocketConnected}
	Socket connected
{:else}
	Socket not connected
{/if}
<!--{#await statusSocket}-->
<!--	Connecting to socket-->
<!--{:then value}-->
<!--	connected: {JSON.stringify(value)}-->
<!--{:catch error}-->
<!--	error: {error}-->
<!--{/await}-->