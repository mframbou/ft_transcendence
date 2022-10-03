<script lang="ts">

	import { pongSocket, chatSocketConnected } from '$lib/websocket-stores';
	import { onDestroy } from 'svelte';
	import NotificationPopup from "$lib/NotificationPopup.svelte";

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

<NotificationPopup>
	test<br>
	hello everyone<br>
	pouet
</NotificationPopup>
