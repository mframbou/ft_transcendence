<script lang="ts">
	import { io } from '$lib/socket-io';
	import { user } from '$lib/stores';

	function sendMessage()
	{
		io.emit('message', 'Test test');
	}

	function getUserPfp(user)
	{
		return user.profilePicture;git stau
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


	const onFileSelected = (e) =>
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

</style>