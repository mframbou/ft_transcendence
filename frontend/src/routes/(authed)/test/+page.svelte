<script lang="ts">

	import { pongSocket, chatSocketConnected } from '$lib/websocket-stores';
	import { onDestroy, onMount } from 'svelte';
	import NotificationPopup from "$lib/NotificationPopup.svelte";
	import NotificationPopupList from "$lib/NotificationPopupList.svelte";

	onDestroy(() => {
		console.log('destroy');
		if ($chatSocketConnected)
		{
			console.log('emitting');
			$pongSocket.emit("message", '');
			console.log('emitted')
		}
	})

	let addNotification;

	onMount(() => {
		for (let i = 0; i < 10; i++)
		{
			setTimeout(() => {
				const randomStrBetween10And20 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
				addNotification(`Notification ${i}, ${randomStrBetween10And20}`);
			}, 1000 * i + i * 10);
		}
	});

</script>

<NotificationPopupList bind:addNotification/>
