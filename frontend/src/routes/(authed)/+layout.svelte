<script lang="ts">
    import '$lib/assets/global.scss';
    import NavbarV2 from '$lib/NavbarV2.svelte';
    import { statusSocket, statusSocketConnected } from "$lib/websocket-stores";
    import { notificationSocket, notificationSocketConnected } from "$lib/websocket-stores";
		import { addNotification, notifications } from '$lib/stores';
		import NotificationPopup from '$lib/NotificationPopup.svelte';
    import {onDestroy} from "svelte";
    import { goto } from '$app/navigation';
		import NotificationPopupList from "../../lib/NotificationPopupList.svelte";

    const unsubscribeStatus = statusSocket.subscribe(() => {});
    const unsubscribeNotification = notificationSocket.subscribe(() => {});

	const MAX_NOTIF_LENGHT = 250;
	let unique: any = {};
	let notif: any;

    $statusSocket.on('wrongToken', () => {
        document.location.replace('/api/auth/logout'); // redirect to logout to remove cookie
	});

	$notificationSocket.on('notification', (data) => {
		console.log("notification received : ", data);
		notif = data;
		notif.content = notif.content.substring(0, Math.max(notif.content.length, MAX_NOTIF_LENGHT)) + "...".substring(3 * (notif.content.length < MAX_NOTIF_LENGHT));
		notif.title = notif.title.substring(0, Math.max(notif.title.length, MAX_NOTIF_LENGHT)) + "...".substring(3 * (notif.title.length < MAX_NOTIF_LENGHT));
		console.log("notif : ", notif);
		//addNotification(notif.title + ' ---- ' + notif.content);
		addNotification(notif);
		//alert(data.service + ": " + data.title + "\n" + data.content + "\n" + "link: " + data.link);
		unique = {};
	});

	onDestroy(() => {
		unsubscribeStatus();
		unsubscribeNotification();
	});

</script>



<div class="wrapper">
	<!--	Relative pos with flex column so that we dont need margin top (so we can change navbar height without having to bother changing in layout) -->
	<div class="navbar-wrapper">
		<NavbarV2 relativePos={true}/>
	</div>
	<main>
		<slot/>
	</main>
</div>


<NotificationPopupList/>
<!--{#key unique}-->
<!--	{#if notif}-->
<!--		<NotificationPopup>-->
<!--				<p>{notif.service}</p>-->
<!--				<p>{notif.title}</p>-->
<!--				<p>{notif.content}</p>-->
<!--		</NotificationPopup>-->
<!--	{/if}-->
<!--{/key}-->


<style lang="scss">

	@media (min-width: 860px)
	{
		.wrapper
		{
			flex-direction: column;
		}
	}

	@media (max-width: 859px)
	{
		.wrapper
		{
			flex-direction: row;
		}
	}

	.navbar-wrapper
	{
		flex: 0 0 auto;
	}

	.wrapper
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #0C0813;

		display: flex;
	}

	main
	{
		flex-grow: 1;
		position: relative;
		overflow: auto;
		z-index: 0; // so that child can have different z-index without going behind 'wrapper'
		//transform-style: preserve-3d;
	}

	h3 {
		background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
	}
</style>
