<script lang="ts">
	import { user, fetchUser } from '../../../lib/stores';
	import { otpVerifyAndClear } from '../../../lib/stores';
	import { fly } from 'svelte/transition';

	import Modal from '$lib/Modal.svelte';
	import OTPInput from "$lib/OTPInput.svelte";
	import Button from "$lib/Button.svelte";
	import ParticlesBackground from '$lib/ParticlesBackground.svelte';

	let wrongCodeDuration = 4000;
	let wrongCode = false;
	let errorMessage = '';

	$otpVerifyAndClear = verifyCode;

	async function verifyCode(otpCode: number): Promise<boolean>
	{
		console.log('verifing');
		wrongCode = false;

		const res = await fetch(`/api/2fa/verify?code=${otpCode}`);

		if (res.ok)
		{
			qr = null; // very bad practice should do showModal but im dsamain so not mframbou's fault
			await fetchUser(); // to update button disable/enable
			return false;
		}

		if (res.status === 401)
		{
			wrongCode = true;
			errorMessage = 'Your code is invalid, please try again'
			new Promise(resolve => setTimeout(resolve, wrongCodeDuration))
					.then(() => wrongCode = false);
		}
		// 409 = 2Fa already done
		else if (res.status === 409) // should never happen with hooks
		{
			wrongCode = true;
			errorMessage = 'You have already verified your 2fa code'
			new Promise(resolve => setTimeout(resolve, wrongCodeDuration))
					.then(() => wrongCode = false);
		}

		return true;
	}

	let formErrors = {};

	let username = '';

	let base64image = null;
	let imageUploaded = false;
	let updating = false;

	async function updateUser(e)
	{
		formErrors = {};

		// wait for image to be converted to base64
		if (imageUploaded)
		{
			while (!base64image)
			{
				await new Promise(resolve => setTimeout(resolve, 5));
			}
		}

		if (username !== '')
		{
			if (username.match(/\s/))
				formErrors['username'] = 'Username cannot contain whitespace';
			else if (username.length < 3)
				formErrors['username'] = 'Username must be at least 3 characters';
			else if (username.length > 20)
				formErrors['username'] = 'Username cannot be longer than 20 characters';
		}

		if (base64image != null)
		{
			if (base64image.length > 10485760)
				formErrors['profilePicture'] = 'Image must be less than 10mb';
		}

		if (Object.keys(formErrors).length > 0)
			return;

		updating = true;
		const response = await fetch('/api/users/update/me', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			// https://www.prisma.io/docs/concepts/components/prisma-client/null-and-undefined
			body: JSON.stringify({
				username: username !== '' ? username : undefined,
				profilePicture: base64image !== null ? base64image : undefined,
			}),
			credentials: 'include'
		});

		// Dont ask server for user since update already returns new user
		if (response.ok)
			$user = await response.json();

		if (response.status === 422)
		{
			const errors = await response.json();
			const message = errors.message;

			if (message.toLowerCase().includes('username'))
				formErrors['username'] = message;
			else if (message.toLowerCase().includes('image'))
				formErrors['profilePicture'] = message;

			console.log(formErrors);
		}
		updating = false;
	}


	function onFileSelected(e)
	{
		imageUploaded = false;
		base64image = null;
		const image = e.target.files[0];
		const reader = new FileReader();
		reader.onload = e =>
		{
			base64image = e.target.result;
		};

		if (image) // avoid opening prompt and selecting nothing
		{
			imageUploaded = true;
			reader.readAsDataURL(image);
		}
	};


	let qr = null;

	async function enable2fa(e)
	{
		const button = e.target;
		button.disabled = true;

		const res = await fetch('/api/2fa/activate');
		if (res.ok)
		{
			const data = await res.json();
			qr = data.qrUri;
		}
		else if (res.status === 409)
		{
			// should not happen because button is hidden if already enabled
			console.log("2FA already enabled on your account");
		}
		else
			console.log('error while fetching user data after 2fa disable');

		await fetchUser();
		button.disabled = false;
	}

	async function disable2fa(e)
	{
		const button = e.target;
		button.disabled = true;

		qr = null;

		const res = await fetch('/api/2fa/deactivate');
		if (res.ok)
			await fetchUser();
		else
			console.log('error while fetching user data after 2fa disable');

		button.disabled = false;
	}



	let crop = { x: 0, y: 0 };
	let zoom = 1;
	let image = "https://cdn1-www.dogtime.com/assets/uploads/2011/03/puppy-development.jpg";

	function handleCrop(e)
	{
		const area = e.detail;
		const pixels = area.pixels;
		console.log(pixels.x, pixels.y, pixels.width, pixels.height)
	}

</script>

<div class="background">
	<ParticlesBackground properties={{minVelocity: 0.35, maxVelocity: 0.5, lineColor: '#958ebe'}}/>
</div>

{#if $user}
	<div class="settings-wrapper">
		<section class="profile">
			<h1 class="heading">Profile</h1>
			<form class="profile-form" on:submit|preventDefault={updateUser}>

				<label for="settings-username">Username</label>
				{#if formErrors.username}<span style="color: red">{formErrors.username}</span>{/if}
				<input id="settings-username" placeholder={$user.username} bind:value={username} type="text">

				<label for="settings-profile-picture">Profile picture</label>
				{#if formErrors.profilePicture}<span style="color: red">{formErrors.profilePicture}</span>{/if}
				<input id="settings-profile-picture" accept="image/png, image/gif, image/jpeg" on:change={onFileSelected} type="file">

				<button type="submit" disabled={updating}>Update username</button>
			</form>
			{#if base64image}
				<img class="pfp-preview" src={base64image}>
			{:else}
				No image
			{/if}
		</section>

		<section class="security">

			<h1 class="heading">Security</h1>
			<div class="modal two-factor-settings">
				<h2 class="subtitle">
					Two-Factor Authentication
					{#if $user.twoFactorEnabled}
						<span class="badge-enabled">Enabled</span>
					{:else}
						<span class="badge-disabled">Disabled</span>
					{/if}
				</h2>

				<span class="description">Enabling this option will require you to enter a code generated by your phone every time you log in.</span>
				<div class="toggle-button">
					{#if $user.twoFactorEnabled}
						<Button on:click={disable2fa} --horizontal-padding="15px" --vertical-padding="10px">Disable</Button>
					{:else}
						<Button on:click={enable2fa} --horizontal-padding="15px" --vertical-padding="10px">Enable</Button>
					{/if}
				</div>

				{#if qr}
				<div class="qr-modal">
					<Modal closeOnClickOutside={false}>
						<h1>Enable Two-Factor Authentication</h1>
						<ol class="steps">
							<li>Download a 2FA app such as <strong>Google Authenticator</strong> or <strong>Auhty</strong>.</li>
							<li>Scan the QR code below:</li>
							<img src={qr}>
							<li>Enter the code generated by the app:</li>
						</ol>
						<OTPInput --color="black" --background-color='#bbb'/>
						{#if wrongCode}
							<div class="wrong-code" transition:fly={{duration: 800}}>
								<strong>{errorMessage}</strong>
							</div>
						{/if}
					</Modal>
				</div>
				{/if}
			</div>
		</section>

	</div>
{/if}

<!--<button on:click={get}>Send message</button>-->

<style lang="scss">

	.background
	{
		opacity: 0.6;

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		transform: translateZ(-1px);
	}

	.two-factor-settings
	{
		padding: 20px;
		width: 100%;

		.description
		{
			display: inline-block;
			width: 85%;
			overflow-wrap: normal;
			text-align: justify;
		}

		.badge-disabled
		{
			background-color: desaturate(#5b45b9, 100%);
			color: #fff;
			padding: 5px;
			border-radius: 5px;
			font-size: 12px;
			margin-left: 10px;
			vertical-align: middle;
		}

		.badge-enabled
		{
			background-color: #5b45b9;
			color: #fff;
			padding: 5px;
			border-radius: 5px;
			font-size: 12px;
			margin-left: 10px;
			vertical-align: middle;
		}

		.toggle-button
		{
			margin: 5px;
			font-size: 1em;
			float: right;
		}

	}

	.settings-wrapper
	{
		$bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 20px auto 0 auto;
		width: 90%;
		max-width: 800px;
		background-color: $bg-color;
		gap: 20px;
		border-radius: 10px;

		section
		{
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.heading
			{
				font-family: Montserrat;
				font-weight: 700;
				border-bottom: 1px solid black;
				width: 80%;
				text-align: center;
				margin: 20px;
				padding: 10px;
			}
		}
	}

	.profile-form
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	button, input
	{
		padding: 10px;
	}

	.pfp-preview
	{
		margin: 20px;
		width: 20em;
		border-radius: 0.2em;
		object-fit: cover; // to make square
		aspect-ratio: 1;
	}

	.qr-modal
	{
		ol
		{
			list-style: none;
			counter-reset: steps; // init counter
			display: flex;
			flex-direction: column;
			align-items: start;
			justify-content: space-between;
			gap: 0.2em;
		}

		li
		{
			counter-increment: steps; // increment counter
			&:before
			{
				margin-right: 5px;
				content: counter(steps);
				background: #8bc5f3;
				border-radius: 100%;
				color: white;
				width: 1.3em;
				aspect-ratio: 1;
				display: inline-flex;
				justify-content: center;
				align-items: center;
			}

			strong
			{
				color: #00a8ff;
			}
		}
		h1
		{
			// disable wrapping
			white-space: nowrap;
			font-size: 1.3em;
			margin: 10px 0;
		}

		img
		{
			align-self: center;
			margin: 15px;
			width: 250px;
			aspect-ratio: 1;
		}

		.wrong-code
		{
			align-self: center;
			color: red;
			font-weight: bold;
		}
	}

	.subtitle
	{
		display: flex;
		flex-direction: row;
		align-items: center;
	}

</style>