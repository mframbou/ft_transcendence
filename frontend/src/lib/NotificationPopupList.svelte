<script lang="ts">

	import NotificationPopup from '$lib/NotificationPopup.svelte';
	import { onMount } from 'svelte';

	let notifications = [];

	export function addNotification(notification) {
		notifications.push(notification);
	}

</script>

<div class="wrapper">
	<div class="notification-list">

	</div>
</div>

<style lang="scss">

	.notification-list
	{
		display: flex;
		flex-direction: column;
	}

</style>