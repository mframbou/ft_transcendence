
<script lang="ts">
    import Button from "./Button.svelte";

    let roomName: string = '';
    let password: string = '';
</script>



<div class="wrapper">
    <input type="text" placeholder="Room name" bind:value={roomName} />
    <input type="text" placeholder="password (optional)" bind:value={password} />
    <Button>create</Button>
</div>


<style lang="scss">

	.wrapper
	{
		$bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);

		display: flex;
		flex-direction: row;
		margin: 20px;
		width: 35%;
        max-height: 100px ;
		max-width: 800px;
		background-color: $bg-color;
		gap: 10px;
		border-radius: 10px;
        padding: 1%;

	}

    input
	{
		position: relative;
		//padding: 15px 0 0;
		margin: 15px;
		width: 50%;
		font-size: 16px;
        color: black;

    }

</style>