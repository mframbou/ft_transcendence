<script lang="ts">
	import { browser } from '$app/env';
	import { slide, fade } from 'svelte/transition';

	const otpSubmitUrl = '/api/2fa/verify'

	let wrongCodeDuration = 4000;
	let wrongCode = false;
	let verifyingCode = false;

	if (browser)
	{
		const urlParams = new URLSearchParams(window.location.search);
		wrongCode = urlParams.get('wrong_code') === 'true';
	}

	let otpCode = '';

	async function verifyCode()
	{
		wrongCode = false;
		verifyingCode = true;
		const res = await fetch(`/api/2fa/verify?code=${otpCode}`);
		otpCode = '';

		// 409 = 2Fa already done
		if (res.ok || res.status === 409)
		{
			window.location.replace('/');
			return;
		}

		if (res.status === 401)
		{
			wrongCode = true;
			new Promise(resolve => setTimeout(resolve, wrongCodeDuration))
					.then(() => wrongCode = false);
		}

		verifyingCode = false;
	}

</script>

{#if wrongCode}
	<div class="wrong-code" transition:slide={{duration: 800}}>
		<strong >Wrong code, try again</strong>
	</div>
{/if}
<form on:submit|preventDefault={verifyCode} method="GET">
	Enter your code here: {wrongCode}
	<input name="code" placeholder="123456" type="text" bind:value={otpCode}>
	<button type="submit" disabled={verifyingCode}>Submit</button>
</form>

<style lang="scss">

	.wrong-code
	{
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: left;
		width: 100%;
		height: 50px;
		padding: 0 20px;
		color: #fff;
		background-color: #f00;
	}

	form
	{
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		height: 100vh;
		gap: 10px;
	}

	input, button
	{
		width: 200px;
		height: 40px;
	}
</style>