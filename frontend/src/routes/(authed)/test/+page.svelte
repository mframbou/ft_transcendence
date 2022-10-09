<script lang="ts">

	import { pongSocket, chatSocketConnected } from '$lib/websocket-stores';
	import { onDestroy, onMount } from 'svelte';
	import NotificationPopup from "$lib/NotificationPopup.svelte";
	import NotificationPopupList from "$lib/NotificationPopupList.svelte";
	import { addNotification } from '$lib/stores';
	import Button from "$lib/Button.svelte";
	import { goto, afterNavigate } from "$app/navigation";

	onDestroy(() => {
		console.log('destroy');
		if ($chatSocketConnected)
		{
			console.log('emitting');
			$pongSocket.emit("message", '');
			console.log('emitted')
		}
	})

	// on navigation print
	afterNavigate(() => {
		console.log('afterNavigate');
	})


	onMount(() => {
		//for (let i = 0; i < 10; i++)
		//{
		//	setTimeout(() => {
		//		const randomStrBetween10And20 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		// 		addNotification(`Notification ${i}, ${randomStrBetween10And20}`);
		// 	}, 1000 * i + i * 10);
		// }
		return;
	});

</script>

<NotificationPopupList/>

<Button on:click={async () => {
    await goto('/test?pouet=true');
}}>Pouet pouet test</Button>
