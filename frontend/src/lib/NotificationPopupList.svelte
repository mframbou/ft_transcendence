<script lang="ts">

	import NotificationPopup from '$lib/NotificationPopup.svelte';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { notifications } from '$lib/stores';
	import Button from "./Button.svelte";
    import { loop_guard } from 'svelte/internal';
    import { goto } from '$app/navigation';

	let hiddenNotificationsIds: number[] = [];
	let id: number = 0;

	// only remove when nothing is shown to avoid bug (so when notifs match hidden notifs)
	function removeNotification(id: number)
	{
		hiddenNotificationsIds.push(id);

		if ($notifications.length !== hiddenNotificationsIds.length)
			return;

		$notifications = [];
		hiddenNotificationsIds = [];
	}

	$: if ($notifications)
	{
		console.log('new notifs', $notifications);
	}

	function acceptNotif(id: number)
	{
		console.log('accept', id);
		const notif = $notifications.find(n => n.id === id);
		if (notif && notif.accept)
		{
			notif.accept();
			removeNotification(id);
			acceptedOrDeclined = true;
		}
	}

	function declineNotif(id: number)
	{
		console.log('decline', id);
		const notif = $notifications.find(n => n.id === id);
		if (notif && notif.decline)
		{
			notif.decline();
			removeNotification(id);
			acceptedOrDeclined = true;
		}
	}

	let acceptedOrDeclined = false;

	function f() {
		console.log("Bonjour a tous les amis");
	}
</script>


<div class="wrapper">
	<div class="notification-list">
		{#each $notifications.filter(n => !hiddenNotificationsIds.includes(n.id)) as notification (notification.id)}
			<div class="notification" transition:slide animate:flip on:click={() => {  
				// on click go to notif.link if it exist, 
				if (notification.link) { 
					goto(notification.link);
					// hot reload don't seem to work if u go from page/[x] to page/[y] so we reload the page
					// timeout is here because if we don't wait the page will reload before we reach the new page
					setTimeout(() => {location.reload()}, 100);
				} 
			}}>

					<NotificationPopup on:close={() => removeNotification(notification.id)} fixedPosition={false}>
						<div class="notification-content">
							<span class="notification-text">{notification.text}</span>
							<div class="notification-buttons">
								{#if notification.accept}
									<Button --vertical-padding="10px" --horizontal-padding="15px" on:click={() => acceptNotif(notification.id)}>
										<span class="button-content">
											Accept
										</span>
									</Button>
								{/if}
								{#if notification.decline}
									<Button --vertical-padding="10px" --horizontal-padding="15px" on:click={() => declineNotif(notification.id)}>
										<span class="button-content">
											Decline
										</span>
									</Button>
								{/if}
							</div>
						</div>
					</NotificationPopup>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">

	.notification-list
	{
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: .2rem;
	}

	.notification-content
	{
		display: flex;
		flex-direction: column;
		gap: .5rem;
	}

	.button-content
	{
		font-size: 0.9rem;
	}

	.notification-buttons
	{
		display: flex;
		flex-direction: row;
		gap: .2rem;
		width: 100%;
		justify-content: space-around;
	}

	.notification
	{
		//transition: all 2s ease-in-out;
		width: 100%;

	}

	.notification:hover
	{
		transform: scale(1.05);
		
	}

</style>