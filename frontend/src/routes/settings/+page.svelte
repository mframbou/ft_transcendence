<script lang="ts">
	import { io } from '$lib/socket-io';
	import { user, fetchUser } from '$lib/stores';
	import { otpVerifyAndClear } from '$lib/stores';
	import { fly } from 'svelte/transition';

	import Modal from '$lib/Modal.svelte';
	import OTPInput from "$lib/OTPInput.svelte";

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

	function sendMessage()
	{
		io.emit('message', 'Test test');
	}

	function getUserPfp(user)
	{
		return user.profilePicture;
	}

	let errors = {};

	let username = '';
	let base64image = null;
	let imageUploaded = false;

	async function updateUsername(e)
	{
		errors = {};

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
				errors['username'] = 'Username cannot contain whitespace';
			else if (username.length < 3)
				errors['username'] = 'Username must be at least 3 characters';
			else if (username.length > 20)
				errors['username'] = 'Username cannot be longer than 20 characters';
		}

		if (base64image != null)
		{
			if (base64image.length > 10485760)
				errors['profilePicture'] = 'Image must be less than 10mb';
		}

		if (Object.keys(errors).length > 0)
			return;

		const response = await fetch('/api/users/update/me', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				profilePicture: base64image,
			}),
			credentials: 'include'
		});

		// Dont ask server for user since update already returns new user
		$user = await response.json();
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

<form enctype="application/x-www-form-urlencoded"
			method="POST"
			on:submit|preventDefault={updateUsername}>
	New username:
	{#if errors.username}<span style="color: red">{errors.username}</span>{/if}
	<input bind:value={username} type="text">
	<br>
	New profile picture
	{#if errors.profilePicture}<span style="color: red">{errors.profilePicture}</span>{/if}
	<input accept="image/png, image/gif, image/jpeg" on:change={onFileSelected} type="file">
	<button type="submit">Update username</button>
</form>

{#if base64image}
	<img class="pfp-preview" src={base64image}>
{:else}
	No image
{/if}

<div class="2fa-settings">
	<h2>2FA Settings</h2>

	{#if $user && $user.twoFactorEnabled}
		2FA is enabled on your account
		<button on:click={disable2fa}>Disable 2FA</button>
	{:else if $user}
		2FA is not enabled on your account
		<button on:click={enable2fa}>Enable 2FA</button>
	{/if}

	<div class="qr-modal">

	{#if qr}
<!--		<Modal>Test</Modal>-->
		<Modal>
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
	{/if}
	</div>
</div>

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
	button, input
	{
		height: 40px;
		margin: 10px;
		padding: 10px;
	}

	.pfp-preview
	{
		width: 30em;
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