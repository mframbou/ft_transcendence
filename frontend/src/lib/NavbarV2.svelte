<style lang="scss">

	.wrapper
	{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 85px;
		background: transparent;
		color: white;
	}

	.logo
	{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		img
		{
			height: 45%;
			cursor: pointer;

			&:hover
			{
				filter: brightness(0.9);
			}
		}

		height: 100%;
		position: absolute;
		left: 35px;
		vertical-align: middle;
	}

	.profile
	{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		height: 100%;
		position: absolute;
		right: 35px;

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
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 25px;

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
	}

</style>


<script lang="ts">

	import { onMount } from 'svelte';

	interface NavItem
	{
		name: string;
		elt: HTMLElement;
	}

	export let navigation: string[] = ['play', 'chat', 'friends', 'settings'];
	let current: string = navigation[0];
	let navItems: NavItem[] = navigation.map((name) => ({ name: name, elt: null }));
	let navPoint;
	let navDiv;
	let navPointRadius = 0;

	onMount(async () => {
		navPointRadius = navPoint.getBoundingClientRect().width / 2;
		changeCurrent(navigation[0]); // to position point
	});

	function changeCurrent(newCurrent: string)
	{
		current = newCurrent;
		navDiv.appendChild(navPoint);

		let navElement = navItems.find((item) => item.name === current).elt;

		// make position relative to the nav element
		// use percentage instead of fixed px to make it responsive without adding resize listener
		let percentage = navElement.offsetLeft / navDiv.offsetWidth + navElement.offsetWidth / navDiv.offsetWidth / 2;
		navPoint.style.left = `calc(${percentage * 100}% - ${navPointRadius}px)`;
	}

</script>

<div class="wrapper">
	<div class="logo">
		<img src="/images/bellopongo-white.png">
	</div>
	<div class="navigation" bind:this={navDiv}>

		{#each navItems as nav}
			<a on:click={() => changeCurrent(nav.name)}
				 href="#" class:current={nav.name === current}
				 bind:this={nav.elt}
			>
				{nav.name}
			</a>

		{/each}
		<div class="nav-point" bind:this={navPoint}/>

	</div>
	<div class="profile">
		<button>Log out</button>
	</div>
</div>