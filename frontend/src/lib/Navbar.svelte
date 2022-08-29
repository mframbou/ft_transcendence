<script lang="ts">
	import { browser } from '$app/env';
	import { getUser } from "$lib/stores";

	function toggleSideNav()
	{
		if (browser)
		{
			// ! Means that we know for sure elt wont be null
			document.querySelector('.sidenav')!.classList.toggle('hidden');
			document.querySelector('.sidenav-toggle')!.classList.toggle('hidden');
		}
	}

	function getUserPfp(user) {
		return user.profilePicture;
	}

	const hostname = browser ? window.location.hostname : 'localhost';
	const [userData] = getUser(hostname);

</script>

<div class="wrapper">
	<!-- Sidenav is hidden by default on mobile -->
	<button on:click={toggleSideNav} class="fa-solid fa-bars sidenav-toggle hidden"></button>
	<div class="sidenav hidden">

		<button>Play</button>
		<button>Chat</button>
		<button class="profile">
			<!-- To avoid showing 'undefined' for a few frames at page load -->
			{#if $userData.username && $userData.profilePicture}
				<span>{$userData.username}</span>
				<img src={$userData.profilePicture}/>
			{/if}
		</button>

	</div>
</div>

<style lang="scss">
	$sidenav-mobile-width: 250px;
	$sidenav-desktop-width: 100%;
	$sidenav-transition: 0.3s ease-in-out;

	$sidenav-bg-color: #172A3A;

	.sidenav button
	{
		border: none;
		background-color: transparent;
		color: white;
		font-family: Lato;
		font-size: 20px;
		font-weight: bold;
		cursor: pointer;
		overflow: hidden;

		transition: background-color 0.1s ease-in-out;

		&:hover
		{
			background-color: #e7b71e;
		}
	}


	@media (max-width: 980px)
	{
		.hidden
		{
			transform: translateX(-$sidenav-mobile-width);
		}

		.sidenav-toggle
		{
			display: block;
			opacity: 1;
		}


		.sidenav
		{
			$padding-bottom-mobile: 15px; // for easier clicking

			button
			{
				width: 100%;
				height: calc(4em + $padding-bottom-mobile);
			}

			position: fixed;
			top: 0;
			left: 0;
			width: $sidenav-mobile-width;
			height: 100%;
			transition: transform $sidenav-transition;
			backdrop-filter: blur(10px);

			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;

			.nav-buttons
			{
				flex-direction: column;
				margin-top: 15px;
				height: 100%;
			}

			.profile
			{
				flex-direction: row-reverse;
				justify-content: start;
				align-items: center;

				margin-top: auto;
				padding: 0 10px $padding-bottom-mobile 10px; // left right padding + and bottom for easier clicking
			}
		}

	}

	@media (min-width: 980px)
	{
		.hidden
		{
			transform: translateX(0);
		}

		.sidenav-toggle
		{
			display: none;
			opacity: 0;
		}

		.sidenav
		{
			button
			{
				height: 100%;
				width: 10em;
			}

			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: start;
			width: 100%;
			height: 90px;
		}

		.profile
		{
			padding: 0 10px; // left right padding

			min-width: 8em; // To make it easier to click on small usernames (eg. |||)
			max-width: 20em;
			width: auto !important;
			//width: 20em !important;
			position: relative;

			flex-direction: row;
			justify-content: end;
			margin-left: auto;
		}

		.nav-buttons
		{
			margin-left: 10px;
		}
	}

	.profile
	{
		align-items:center;
		display: flex;
		overflow: hidden;
		gap: 5px;

		span
		{
			text-overflow: ellipsis;
			white-space: nowrap;
			//width: 80%;
			overflow: hidden;
			text-align: right;
		}

		img
		{

			width: 3em;
			//height: 50%;
			aspect-ratio: 1;

			//position: absolute;
			//top: 50%;
			//right: 5px;
			//transform: translateY(-50%);

			border-radius: 3em;

			object-fit: cover;
		}
	}

	.sidenav
	{
		background-color: $sidenav-bg-color;
	}

	@keyframes fadeIn
	{
		from
		{
			opacity: 0;
		}
		to
		{
			opacity: 1;
		}
	}

	.sidenav-toggle
	{
		position: fixed;
		top: 7px;
		left: 7px + $sidenav-mobile-width;
		//z-index: 999;
		padding: 10px 15px;
		cursor: pointer;
		transition: transform $sidenav-transition;
		color: white;
		border-radius: 5px;
		background-color: #838383;
		outline: none;

		border-top: none;
		border-left: none;
		border-bottom: 2px solid #222;
		border-right: 2px solid #222;

		&:hover
		{
			background-color: #939393;
		}

		&:active, &:focus
		{
			outline: none;

			border-top: none;
			border-left: none;
			border-bottom: 2px solid #222;
			border-right: 2px solid #222;
		}
	}

	.nav-buttons
	{
		display: flex;
		align-items: center;
		justify-content: center;
		list-style: none;
		gap: 15px;
		width: 100%;
	}

	.wrapper
	{
		z-index: var(--z-index, 999);
	}


</style>