<script lang="ts">

	import {browser} from '$app/env';

	function toggleSideNav()
	{
		if (browser)
		{
			// ! Means that we know for sure elt wont be null
			document.querySelector('.sidenav')!.classList.toggle('hidden');
			document.querySelector('.sidenav-toggle')!.classList.toggle('hidden');
		}
	}

	export let showProfileMenu = false;

</script>

<div class="wrapper">
	<!-- Sidenav is hidden by default on mobile -->
	<button on:click={toggleSideNav} class="fa-solid fa-bars sidenav-toggle hidden"></button>
	<div class="sidenav hidden">
		<ul>
			<li>
				<button class="pushable-back">
					<span class="pushable-front">Play</span>
				</button>
			</li>
			<li>
				<button class="pushable-back">
					<span class="pushable-front">Chat</span>
				</button>
			</li>
			<!--			<li>-->
			<!--				<button class="pushable-back">-->
			<!--					<span class="pushable-front">Bing chilling</span>-->
			<!--				</button>-->
			<!--			</li>-->
			<li class="profile">
				<button class="pushable-back">
					<span class="pushable-front" on:click={() => showProfileMenu = true}>
						<img src="/images/oronda.png"/>
						My Profile
					</span>
				</button>
				{#if showProfileMenu}
					<div class="click-handler"
							 style="position: fixed; top: 0; left: 0; width: 100vw; height:100vh; background-color: transparent"
							 on:click={() => showProfileMenu = false}/>
					<div class="test">
						Pouet pouet
					</div>
				{/if}
			</li>
		</ul>
	</div>
</div>

<style lang="scss">
	$sidenav-mobile-width: 250px;
	$sidenav-desktop-width: 100%;
	$sidenav-transition: 0.3s ease-in-out;

	$sidenav-bg-color: #172A3A;

	.profile
	{
		position: relative;
	}

	.test
	{
		background: green;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100px;
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

		.pushable-back
		{
			width: $sidenav-mobile-width - 20px;
		}

		.sidenav
		{
			position: fixed;
			top: 0;
			left: 0;
			width: $sidenav-mobile-width;
			height: 100%;
			transition: transform $sidenav-transition;
			backdrop-filter: blur(10px);
		}

		ul
		{
			flex-direction: column;
			margin-top: 15px;
			height: 100%;
		}

		.profile
		{
			margin-top: auto;
			margin-bottom: 25px;
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

		.pushable-back
		{
			width: 200px;
		}

		.sidenav
		{
			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: center;
			width: 100%;
			height: 90px;
			border-bottom: 2px solid #0e2554;
		}

		.profile
		{
			margin-left: auto;
			margin-right: 10px;
		}

		ul
		{
			margin-left: 10px;
		}
	}

	.profile
	{
		.pushable-front
		{
			justify-content: flex-start;
		}

		img
		{
			position: absolute;
			top: 50%;
			right: 5px;
			transform: translateY(-50%);

			height: 3em;
			border-radius: 3em;
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

	.pushable-back
	{
		height: 60px;
		border: none;
		border-radius: 999px;
		outline: none;
		background-color: transparent;
	}

	.pushable-front
	{
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 10px 32px;
		cursor: pointer;
		transition: transform 250ms;
		color: white;
		border-radius: 999px;
		background-color: transparent;
		will-change: transform;
		border: 3px solid white;

		transition: border .2s ease-out;
		//transition: background 0.5s ease;
		//background: radial-gradient(closest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat;

		&:hover
		{
			//border-width: 10px;
			background-color: rgba(255, 255, 255, 0.1);
			//transform: translateY(-6px);
			//background-color: $sidenav-btn-fg-hover-color;
			//background-size: 100% 200%;
		}

		&:active
		{
			//transform: translateY(-2px);
		}
	}

	ul
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