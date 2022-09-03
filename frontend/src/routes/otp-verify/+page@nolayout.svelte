<script lang="ts">
	import { browser } from '$app/env';
	import { slide, fade } from 'svelte/transition';
	import ParticlesBackground from "$lib/ParticlesBackground.svelte";
	import OTPInput from '$lib/OTPInput.svelte';
	import { otpVerifyAndClear } from '$lib/stores';

	let wrongCodeDuration = 4000;
	let wrongCode = false;
	let errorMessage = '';

	if (browser)
	{
		const urlParams = new URLSearchParams(window.location.search);
		wrongCode = urlParams.get('wrong_code') === 'true';
	}

	async function onCodeComplete(event)
	{
		console.log('code completed');
		// const otpCode = event.detail.code;
	}

	$otpVerifyAndClear = verifyCode;

	async function verifyCode(otpCode: number): Promise<boolean>
	{
		console.log('verifing');
		wrongCode = false;

		const res = await fetch(`/api/2fa/verify?code=${otpCode}`);

		// 409 = 2Fa already done
		if (res.ok || res.status === 409)
		{
			window.location.replace('/');
			return false;
		}

		if (res.status === 401)
		{
			wrongCode = true;
			errorMessage = 'Your code is invalid, please try again'
			new Promise(resolve => setTimeout(resolve, wrongCodeDuration))
					.then(() => wrongCode = false);
		}
		else if (res.status === 409) // should never happen with hooks
		{
			wrongCode = true;
			errorMessage = 'You have already verified your 2fa code'
			new Promise(resolve => setTimeout(resolve, wrongCodeDuration))
					.then(() => wrongCode = false);
		}

		return true;
	}

</script>

{#if wrongCode}
	<div class="wrong-code" transition:slide={{duration: 800}}>
		<strong>{errorMessage}</strong>
	</div>
{/if}

<div class="wrapper">
	<div class="background">
		<ParticlesBackground --pointer-events=none properties={{lineColor: '#888888', minVelocity: 0.5, maxVelocity: 0.8}}/>
	</div>
	<div class="content">
		<span class="prompt">Enter the 6-digit code generated on your mobile device</span>
		<OTPInput on:code-completed={onCodeComplete} --background-color="black"/>
	</div>
</div>

<style lang="scss">

	.wrong-code
	{
		z-index: 1;
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

	.wrapper
	{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.background
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #2c2b27;
	}

	.content
	{
		z-index: 1; // So that text is above the particles, but we can still click the background (if we put the whole wrapper we only click wrapper)

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.prompt
	{
		font-family: Lato;
		font-weight: bold;
		font-size: 1.5rem;
		color: white;
		margin-bottom: 10px;
	}



</style>