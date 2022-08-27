<script lang="ts">
	import { io } from '$lib/socket-io';

	function sendMessage() {
		io.emit('message', "Test test");
		console.log("Send msg");
	}

</script>

<button on:click={sendMessage}>Send message</button>

<style lang="scss">
	button{
		width: 200px;
		height: 50px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>