<script lang="ts">
	import { getBackendUrl } from '../../lib/utils';
	import { browser } from '$app/env';

	const otpSubmitUrl = getBackendUrl(`2fa/verify`);

	let wrongCode = false;

	if (browser)
	{
		const urlParams = new URLSearchParams(window.location.search);
		wrongCode = urlParams.get('wrong_code') === 'true';
	}

</script>

{#if wrongCode}
	<div class="wrong-code">
		<strong>Wrong code, try again</strong>
	</div>
{/if}
<form action={otpSubmitUrl} method="GET">
	Enter your code here: {wrongCode}
	<input name="code" placeholder="123456" type="text">
	<input type="submit" value="Submit">

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

	input
	{
		width: 200px;
		height: 40px;
	}
</style>