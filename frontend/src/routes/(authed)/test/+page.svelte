<script lang="ts">

	import { statusSocket, chatSocket } from '$lib/socket-io';

	// void one of imports so that code isn't unused, because import executes code and we still need to connect
	void statusSocket; // for statussocket we dont need to send anything, just connect / disconnect

	function sendMsg()
	{
		chatSocket.emit('message', 'hello everyone');
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