<script lang="ts">
	import { browser } from '$app/env';
	import { user } from '$lib/stores';
	import { redirectTo } from '$lib/utils';

	function toggleSideNav()
	{
		if (browser)
		{
			// ! Means that we know for sure elt wont be null
			document.querySelector('.sidenav')!.classList.toggle('hidden');
			document.querySelector('.sidenav-toggle')!.classList.toggle('hidden');
		}
	}

	let showDropDownUserMenu: boolean = false;

	function redirectProfile()
	{
		redirectTo('/profile');
	}

	function redirectFriends()
	{
		redirectTo('/friends');
	}

	function redirectSettings()
	{
		redirectTo('/settings');
	}

	function redirectLogout()
	{
		window.location.replace('/api/auth/logout');
	}

	function redirectHomepage()
	{
		redirectTo('/home');
	}

	function redirectPlay()
	{
		redirectTo('/play');
	}

	function redirectChat()
	{
		redirectTo('/chat');
	}

</script>

<div class="wrapper">
	<!-- Sidenav is hidden by default on mobile -->
	<button class="fa-solid fa-bars sidenav-toggle hidden" on:click={toggleSideNav}></button>
	<div class="sidenav hidden">
		<img class="logo" on:click={redirectHomepage} src="/images/bellopongo-white.png"/>
		<a class="nav-button centered-content" on:click={redirectPlay}>Play</a>
		<a class="nav-button centered-content" on:click={redirectChat}>Chat</a>
		{#if $user}
		<a class="nav-button profile" on:click={redirectProfile}
			 on:mouseenter={() => showDropDownUserMenu = true} on:mouseleave={() => showDropDownUserMenu = false}>
			<!-- To avoid showing 'undefined' for a few frames at page load -->
				<img class="profile-picture" src={$user.profilePicture}/>
				<span class="profile-username">{$user.username}</span>
			{#if showDropDownUserMenu}
				<div class="profile-dropdown-menu">
					<ul class="profile-dropdown-list">
						<!-- To avoid propagating to parent and redirecting to profile (on click on button) -->
						<li on:click|stopPropagation={redirectProfile}>Profile</li>
						<li on:click|stopPropagation={redirectFriends}>Friends</li>
						<li on:click|stopPropagation={redirectSettings}>Settings</li>
						<li on:click|stopPropagation={redirectLogout}>Logout</li>
					</ul>
				</div>
			{/if}
		</a>
		{/if}
	</div>
</div>

<style lang="scss">
	///////////////
	// Variables //
	///////////////

	$sidenav-mobile-width: 250px;
	$sidenav-desktop-width: 100%;
	$sidenav-transition: 0.3s ease-in-out;
	$sidenav-bg-color: #172A3A;

	/////////////////////////////
	// Size independent styles //
	/////////////////////////////

	.sidenav
	{
		background-color: $sidenav-bg-color;
	}

	.nav-button
	{
		font-family: Lato;
		font-size: 20px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.1s ease-in-out;
		color: white;
		border: none;

		background-color: transparent;

		&:hover
		{
			background-color: #e7b71e;
		}
	}

	.logo
	{
		cursor: pointer;

		&:hover
		{
			filter: brightness(0.8);
		}
	}

	.sidenav-toggle
	{
		position: fixed;
		top: 7px;
		left: 7px + $sidenav-mobile-width;
		padding: 10px 15px;
		cursor: pointer;
		transition: transform $sidenav-transition;
		color: white;
		border-top: none;
		border-right: 2px solid #222;
		border-bottom: 2px solid #222;

		border-left: none;
		border-radius: 5px;
		outline: none;
		background-color: #838383;

		&:hover
		{
			background-color: #939393;
		}

		&:active, &:focus
		{
			border-top: none;

			border-right: 2px solid #222;
			border-bottom: 2px solid #222;
			border-left: none;
			outline: none;
		}
	}

	.profile-dropdown-menu
	{
		position: absolute;
		width: 100%;

		//height: 100%; // removed so that height is based on content
		background-color: $sidenav-bg-color;

		.profile-dropdown-list
		{
			display: flex;
			align-items: center;
			flex-direction: column;
			justify-content: start;
			list-style: none;

			li
			{
				width: 100%;
				padding: 0.75em;
				text-align: left;

				&:hover
				{
					background-color: #1F3C55;
				}
			}
		}
	}

	.profile
	{
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.profile-username
	{
		overflow: hidden;
		text-align: right;
		//width: 80%;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.profile-picture
	{

		width: 3em;
		border-radius: 0.2em;
		object-fit: cover; // to make square
		aspect-ratio: 1;
	}

	/////////////////
	// Mobile view //
	/////////////////
	@media (max-width: 980px)
	{
		.hidden
		{
			transform: translateX(-$sidenav-mobile-width);
		}

		.sidenav
		{
			$padding-bottom-mobile: 20px; // for easier clicking

			position: fixed;
			top: 0;
			left: 0;
			display: flex;
			align-items: center;
			flex-direction: column;
			justify-content: start;

			width: $sidenav-mobile-width;
			height: 100%;
			transition: transform $sidenav-transition;
			backdrop-filter: blur(10px);

			.profile-dropdown-menu
			{
				// cannot set percentage for obscure reason I guess so just hardcode it just like the button height
				bottom: calc(3.5em + $padding-bottom-mobile);
				left: 0;
			}

			.profile
			{
				align-items: center;
				flex-direction: row;
				justify-content: start;
				height: calc(3.5em + $padding-bottom-mobile);

				margin-top: auto;
				padding: 0px 10px $padding-bottom-mobile 10px; // left right padding + and bottom for easier clicking
			}
		}

		.nav-button
		{
			width: 100%;
			height: 4.2em;
		}

		.logo
		{
			height: 4em;
			padding: 10px 0px;
		}

	}

	//////////////////
	// Desktop view //
	//////////////////
	@media (min-width: 980px)
	{
		.hidden
		{
			transform: translateX(0);
		}

		.sidenav
		{
			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: start;
			width: 100%;
			height: 90px;
		}

		.nav-button
		{
			width: 10em;
			height: 100%;
		}

		.profile
		{
			position: relative;

			flex-direction: row;
			justify-content: end;
			width: auto !important;
			//width: 20em !important;
			min-width: 8em; // To make it easier to click on small usernames (eg. |||)

			max-width: 20em;
			margin-left: auto;
			padding: 0 10px; // left right padding
		}

		.profile-dropdown-menu
		{
			top: 100%;
			right: 0;
		}

		.logo
		{
			height: 50%;
			padding: 0px 20px;
		}
	}

	///////////
	// Utils //
	///////////

	.wrapper
	{
		z-index: var(--z-index, 999);
	}

	.centered-content
	{
		display: flex;
		align-items: center;
		justify-content: center;
	}

</style>