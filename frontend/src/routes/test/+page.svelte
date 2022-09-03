<script lang="ts">

	import { io } from '$lib/socket-io';


	function sendMsg()
	{
		io.connect();
		console.log("connected ? ", io.connected);
		io.emit('message', 'test');
		console.log("emitted");
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