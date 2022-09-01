<script lang="ts">
	import { browser } from '$app/env';
	import { onMount, createEventDispatcher } from 'svelte';
	import { otpVerifyAndClear } from '$lib/stores';

	const dispatch = createEventDispatcher();

	const OTP_DIGITS = 6;
	const OTP_SPLIT_EVERY = 3;
	const formDigits = Array(OTP_DIGITS);

	function clear()
	{
		for (let digit of formDigits)
			digit.value = '';

		if (formDigits[0])
			formDigits[0].focus();

	}

	async function checkCompletion()
	{
		if (formDigits.length !== OTP_DIGITS)
			return;

		for (let digit of formDigits)
		{
			if (digit.value === '')
				return;
		}

		// Everything is inputed, dispatch event
		const otpCode = formDigits.map(digit => digit.value).join('');
		dispatch('code-completed', {
			code: otpCode,
		});

		if ($otpVerifyAndClear)
		{
			const shouldClear = await $otpVerifyAndClear(otpCode);
			if (shouldClear)
				clear();
		}
	}

	onMount(() => {
		if (browser)
		{
			const form = browser ? document.getElementById("otp-digits-input-form") : null;

			if (form)
			{
				for (let i = 0; i < OTP_DIGITS; i++) {
					formDigits[i] = form.querySelector(`#digit-${i}`);
				}
				if (formDigits[0])
					formDigits[0].focus();
			}
		}
	});

	function handleKeyUp(e: KeyboardEvent, i: number)
	{
		let prev = i > 0 ? formDigits[i - 1] : null;
		let next = i < OTP_DIGITS - 1 ? formDigits[i + 1] : null;

		if (e.key.length === 1)
		{
			if (next)
				next.focus();
			return;
		}

		if (e.code === 'Backspace')
		{
			if (prev)
				prev.focus();
		}
		else if (e.code === 'ArrowLeft')
		{
			if (prev)
				prev.focus();
		}
		else if (next)
		{
			next.focus();
		}
	}

</script>

<form id="otp-digits-input-form" autocomplete="off">
	{#each Array(OTP_DIGITS) as _, i}
		{#if i !== 0 && (i) % OTP_SPLIT_EVERY == 0}
			<span class="splitter">&ndash;</span>
		{/if}
		<input class="digit" id={`digit-${i}`} maxlength="1" on:keyup={(e) => {handleKeyUp(e, i); if (i === OTP_DIGITS - 1) { checkCompletion(e) }}}>
	{/each}
</form>

<style lang="scss">

	#otp-digits-input-form
	{
		margin: 10px;

		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-wrap: nowrap;

		color: var(--color, white);

		.digit
		{
			width: 30px;
			height: 50px;
			background-color: var(--background-color, rgb(45, 46, 55));
			border: none;
			line-height: 50px;
			text-align: center;
			font-size: 24px;
			font-family: "Raleway", sans-serif;
			font-weight: 200;
			margin: 0 2px;
			color: var(--color, white);
			border-radius: 3px;
			caret-color: transparent;


			&:focus
			{
				border: 2px solid var(--color, white);
				outline: none;
			}
		}

		.splitter
		{
			padding: 0 5px;
			font-size: 24px;
		}
	}

</style>