<script lang="ts">

	import NotificationPopup from '$lib/NotificationPopup.svelte';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let notifications = [];
	let hiddenNotificationsIds: number[] = [];
	let id: number = 0;

	// only update when adding notif (not removing), otherwise if adding and removing at the same times it's buggy

	export const addNotification = (notification) => {
		const notifId = id++;
		notifications.push({ content: notification, id: notifId });
		notifications = notifications; // https://svelte.dev/tutorial/updating-arrays-and-objects
	}

	// only remove when nothing is shown to avoid bug (so when notifs match hidden notifs)
	function removeNotification(id: number)
	{
		hiddenNotificationsIds.push(id);

		if (notifications.length !== hiddenNotificationsIds.length)
			return;

		notifications = [];
	}

</script>


<div class="wrapper">
	<div class="notification-list">
		{#each notifications.filter(n => !hiddenNotificationsIds.includes(n.id)) as notification (notification.id)}
			<div class="notification" transition:slide animate:flip>
					<NotificationPopup on:close={() => removeNotification(notification.id)} fixedPosition={false}>
						{notification.content}
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

	.notification
	{
		//transition: all 2s ease-in-out;
		width: 100%;
	}

</style>