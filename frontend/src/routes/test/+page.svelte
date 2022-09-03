<script lang="ts">

	import { io } from '$lib/socket-io';


	function sendMsg()
	{
		io.emit('message', 'test');
	}

</script>

<button on:click={sendMsg}>Send</button>

<style lang="scss">
	button
	{
		height: 200px;
		width: 400px;
	}
</style>