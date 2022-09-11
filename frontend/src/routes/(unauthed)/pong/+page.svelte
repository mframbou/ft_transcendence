<script lang="ts">

	import Pong from '$lib/Pong.svelte';
	import Button from '$lib/Button.svelte';
	import NavbarV2 from '$lib/NavbarV2.svelte';

</script>

<style lang="scss">
	.wrapper
	{
		height: 100vh;
		width: 100vw;
		background-color: #0C0813;
		overflow: hidden;
	}

	.content
	{
		margin-top: 85px;
	}


	.banner
	{
		$dim-color: rgba(0, 0, 0, 0.1);
		position: relative;
		width: 100%;
		height: 20em;
		background:linear-gradient($dim-color, $dim-color), url('/images/default-banner.png');

		background-size: cover;
		background-position: center;

		display: flex;
		justify-items: start;
		align-items: flex-end;
		gap: 30px;
		padding: 20px 30px;
	}

	.profile-picture
	{
		aspect-ratio: 1;
		border-radius: 20%;
		object-fit: cover;
		height: 80%;
	}

	.username
	{
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-left: 10px;

		h1
		{
			font-family: NexaBlack;
			font-size: 1.5em;
			color: white;
		}

		h2
		{
			font-family: Montserrat;
			font-size: 1em;
			font-weight: 400;
			color: #a29aaf;
		}
	}

	.buttons
	{
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	.username-buttons
	{
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.banner-button
	{
		display: inline-block;
		width: 12em;
		font-family: Montserrat;
		font-weight: 500;
		font-size: .9em;
	}

</style>

<NavbarV2/>
<div class="wrapper">
	<div class="content">
		<div class="banner">

			<img class="profile-picture" src="https://cdn.intra.42.fr/users/dsamain.jpg">

			<div class="username-buttons">
				<div class="username">
					<h1>BelloPepito</h1>
					<h2>@dsamain</h2>
				</div>

				<div class="buttons">
					<Button on:click={() => alert('test')}>
						<span class="banner-button">Add friend</span>
					</Button>

					<Button border={false} --background="linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))" on:click={() => alert('test')}>
						<span class="banner-button">Message</span>
					</Button>

					<Button border={false} --background="linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))" on:click={() => alert('test')}>
						<span>...</span>
					</Button>
				</div>
			</div>


		</div>
	</div>
</div>

<!--<Pong/>-->