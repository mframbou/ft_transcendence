<script lang="ts">
	import { user, fetchUser } from '../../../lib/stores';
	import { otpVerifyAndClear } from '../../../lib/stores';
	import { fly } from 'svelte/transition';

	import Modal from '../../../lib/Modal.svelte';
	import OTPInput from "../../../lib/OTPInput.svelte";

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

	async function updateUsername(e)
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

</script>


{#if $user}
	<div class="settings-wrapper">

		<section class="profile">
			<h1 class="heading">Profile</h1>
			<form class="profile-form" on:submit|preventDefault={updateUsername}>

				<label for="settings-username">Username</label>
				{#if formErrors.username}<span style="color: red">{formErrors.username}</span>{/if}
				<input id="settings-username" placeholder={$user.username} bind:value={username} type="text">

				<label for="settings-profile-picture">Profile picture</label>
				{#if formErrors.profilePicture}<span style="color: red">{formErrors.profilePicture}</span>{/if}
				<input id="settings-profile-picture" accept="image/png, image/gif, image/jpeg" on:change={onFileSelected} type="file">

				<button type="submit">Update username</button>
			</form>
			{#if base64image}
				<img class="pfp-preview" src={base64image}>
			{:else}
				No image
			{/if}
		</section>


		<section class="security">

			<h1 class="heading">Security</h1>
			<div class="two-factor-settings">
				<h2>
					Two-Factor Authentication
					{#if $user.twoFactorEnabled}
						<span class="badge-enabled">Enabled</span>
					{:else}
						<span class="badge-disabled">Disabled</span>
					{/if}
				</h2>

				<span class="description">Enabling this option will require you to enter a code generated by your phone every time you log in.</span>
				{#if $user.twoFactorEnabled}
					<button on:click={disable2fa}>Disable</button>
				{:else}
					<button on:click={enable2fa}>Enable</button>
				{/if}

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
	//button{
	//	width: 200px;
	//	height: 50px;
	//	position: absolute;
	//	top: 50%;
	//	left: 50%;
	//	transform: translate(-50%, -50%);
	//}

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
			background-color: #8c0c0c;
			color: #fff;
			padding: 5px;
			border-radius: 5px;
			font-size: 12px;
			margin-left: 10px;
			vertical-align: middle;
		}

		.badge-enabled
		{
			background-color: #0a8a0a;
			color: #fff;
			padding: 5px;
			border-radius: 5px;
			font-size: 12px;
			margin-left: 10px;
			vertical-align: middle;
		}

		button
		{
			$background-color: #003cff;

			margin: 5px;
			padding: 10px;
			border-radius: 5px;
			border: none;
			background-color: $background-color;
			color: #fff;
			font-size: 1em;
			cursor: pointer;
			transition: background-color 0.2s ease-in-out;
			float: right;

			&:hover
			{
				background-color: darken($background-color, 10%);
			}
		}

	}

	.settings-wrapper
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 20px auto 0 auto;
		width: 90%;
		max-width: 800px;
		background-color: #ccc;
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

</style>