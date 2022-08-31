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
<form action={otpSubmitUrl} method="GET" >
	Enter your code here: {wrongCode}
	<input type="text" placeholder="123456" name="code">
	<input type="submit" value="Submit">

</form>

<style lang="scss">

	.wrong-code
	{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 50px;
		background-color: #f00;
		color: #fff;
		display: flex;
		flex-direction: row;
		justify-content: left;
		align-items: center;
		padding: 0 20px;
	}

	form
	{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		gap: 10px;
	}

	input
	{
		height: 40px;
		width: 200px;
	}
</style>