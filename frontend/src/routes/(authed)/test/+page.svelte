<script lang="ts">

	import { statusSocket } from '$lib/websocket-stores';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	onMount(async () => {
		if ($statusSocket)
		{
			console.log('Socket already connected');
			$statusSocket.on('ping', (data) => {
				console.log(data);
			});
			$statusSocket.on('pong', (data) => {
				console.log(data);
			});
			$statusSocket.emit('status', { status: 'online' });
		}
	});
	// try
	// {
	// 	const socket = get(await statusSocket);
	// 	socket.on('ping', (data) => {
	// 		console.log(data);
	// 	});
	// 	socket.emit('status', 'Hello from Svelte!');
	// }
	// catch (e)
	// {
	// 	console.error('error in websocket: ' + e);
	// }
	// });


</script>

<!--{#await statusSocket}-->
<!--	Connecting to socket-->
<!--{:then value}-->
<!--	connected: {JSON.stringify(value)}-->
<!--{:catch error}-->
<!--	error: {error}-->
<!--{/await}-->