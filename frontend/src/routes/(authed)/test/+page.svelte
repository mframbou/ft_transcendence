<script lang="ts">

	import { pongSocket, chatSocketConnected } from '$lib/websocket-stores';
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('destroy');
		if ($chatSocketConnected)
		{
			console.log('emitting');
			$pongSocket.emit("message", '');
			console.log('emitted')
		}
	})

</script>
