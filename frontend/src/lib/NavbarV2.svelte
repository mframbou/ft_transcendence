<style lang="scss">


	@media (min-width: 860px)
	{
		.wrapper
		{
			flex-direction: row;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 85px;
		}

		.logo
		{
			height: 100%;
			margin-right: auto;
			margin-left: 15px;

			img
			{
				height: 40%;
			}
		}

		.profile
		{
			height: 100%;
			margin-left: auto;
			margin-right: 15px;
			justify-content: center;
			align-items: center;
		}

		.navigation
		{
			flex-direction: row;
			justify-content: center;
			align-items: center;
			gap: 25px;
		}
	}

	@media (max-width: 859px)
	{
		$elements-padding-left: 15px;

		.wrapper
		{
			flex-direction: column;
			justify-content: center;
			align-items: start;
			width: min(30vw, 200px);
			height: 100%;
		}

		.logo
		{
			width: 100%;
			margin-bottom: auto;
			margin-top: 25px;

			img
			{
				width: 75%;
			}
		}

		.profile
		{
			width: 100%;
			margin-top: auto;
			margin-bottom: 25px;
			justify-content: left;
			align-items: center;
			padding-left: $elements-padding-left;
		}

		.nav-point
		{
			opacity: 0;
		}

		.navigation
		{
			flex-direction: column;
			justify-content: center;
			align-items: start;
			width: 100%;
			padding-left: $elements-padding-left;

			a
			{
				// minimum mobile height
				height: 50px;
				width: 100%;
				display: flex;
				justify-content: left;
				align-items: center;
			}

			gap: 10px;
		}
	}

	.wrapper
	{
		display: flex;

		top: 0;
		left: 0;
		background: transparent;
		color: white;
	}

	.logo
	{
		//position: absolute;
		vertical-align: middle;

		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		img
		{
			cursor: pointer;
			position: relative;

			&:hover
			{
				filter: brightness(0.9);
			}
		}
	}

	.profile
	{
		display: flex;
		flex-direction: row;
		//position: absolute;

		button
		{
			background-color: transparent;
			border: 2px solid rgba(255, 255, 255, 0.85);
			color: inherit;
			padding: 10px 20px;
			border-radius: 100vw;
			cursor: pointer;
			transition: background-color 0.2s ease-in-out;

			text-transform: uppercase;
			font-size: 0.9em;
			font-family: Montserrat;
			font-weight: 400;

			&:hover
			{
				background-color: rgba(255, 255, 255, 0.1);
			}
		}
	}

	.navigation
	{
		$nav-transition: 0.3s ease-in-out;

		position: relative;
		display: flex;

		a
		{
			text-transform: uppercase;
			font-size: 0.9em;
			font-family: Montserrat;
			font-weight: 500;
			text-decoration: inherit;
			color: inherit;
			&:hover
			{
				color: #d0cfd3;
			}
		}

		.current
		{
			transition: color $nav-transition;
			color: #5b45b9 !important;
			position: relative;
		}

		.nav-point
		{
			position: absolute;
			bottom: -14px;

			border-radius: 100%;

			content: "";
			display: block;
			width: 8px;
			aspect-ratio: 1;
			background: #5b45b9;
			transition: left $nav-transition;
		}

		.nav-item
		{
			cursor: pointer;
		}
	}

	.absolute
	{
		position: absolute;
	}

	.relative
	{
		position: relative;
	}

</style>


<script lang="ts">

	import { goto, afterNavigate } from '$app/navigation';

	interface NavItem
	{
		name: string;
		elt: HTMLElement;
	}

	export let navigation: string[] = ['home', 'chat', 'friends', 'spectate', 'profile', 'settings'];
	export let relativePos: boolean = false;
	let current: string = navigation[0];
	let navItems: NavItem[] = navigation.map((name) => ({ name: name, elt: null }));
	let navPoint;
	let navDiv;
	let navPointRadius = 0;

	// after navigate runs on mount and every time we navigate, see doc
	afterNavigate(async () => {
		navPointRadius = navPoint.getBoundingClientRect().width / 2;
		let currentPage = null;

		// Set the initial position of the nav point (if user goes directly to 'chat' dont stay on 'home'
		if (window.location.pathname.length > 1 && window.location.pathname.charAt(0) === '/')
		{
			current = window.location.pathname.substring(1);
		}

		changeCurrent(current);
	});

	function changeCurrent(newCurrent: string)
	{
		if (newCurrent === null)
		{
			navPoint.style.display = 'none';
			return;
		}

		let target = navItems.find((item) => newCurrent.startsWith(item.name));
		if (!target)
		{
			navPoint.style.display = 'none';
			return;
		}

		navPoint.style.display = 'block';
		current = newCurrent;

		// make position relative to the nav element
		// use percentage instead of fixed px to make it responsive without adding resize listener
		let percentage = target.elt.offsetLeft / navDiv.offsetWidth + target.elt.offsetWidth / navDiv.offsetWidth / 2;
		navPoint.style.left = `calc(${percentage * 100}% - ${navPointRadius}px)`;
	}

	async function redirectLogout()
	{
		window.location.replace('/api/auth/logout');
	}
</script>

<div class="wrapper" class:absolute={!relativePos} class:relative={relativePos}>
	<a href={navigation.length > 0 ? ('/' + navigation[0]) : '/'} class="logo">
		<img src="/images/bellopongo-white.png">
	</a>
	<div class="navigation" bind:this={navDiv}>

		{#each navItems as nav}
			<a
				 class:current={nav.name === current}
				 class="nav-item"
				 bind:this={nav.elt}
				 href={`/${nav.name}`}
			>
				{nav.name}
			</a>

		{/each}
		<div class="nav-point" bind:this={navPoint}/>

	</div>
	<div class="profile">
		<button on:click={redirectLogout}>Log out</button>
	</div>
</div>