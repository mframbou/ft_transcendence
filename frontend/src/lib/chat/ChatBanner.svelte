<script lang="ts">
    import Button from "$lib/Button.svelte";

    export let room;
</script>


<div class='wrapper'>

    <p>
        name: {room.name}
    </p>
    <p>
        participants:
        {#each room.participants as participant}
            {participant.user.login}
        {/each}
    </p>    
    <p>
        public: &nbsp {room.is_private ? '❌' : ' ✓'}
    </p>
    <button>join</button>
</div>

<style lang="scss">
    .hflex {
        display: flex;
        flex-direction: row;
    }
    
    .wrapper
	{
		$bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);

        position: relative;
		display: flex;
		flex-direction: space-around;
		margin: 1px;
        width: 50%;
        min-width: 500px;
		//widows: 100%;
		background-color: $bg-color;
		gap: 10px;
		border-radius: 10px;
        padding: 1%;

        p {
            margin: 0;
            padding: 1%;
        }

        button {
            position: absolute;
            right: 10px;
            margin: 0;
            padding: 0;
            width: 20%;
            height: 50%;
            background-color: rgb(88, 146, 0);
            border-radius: 5px;
            color: white;
            font-size: 1.0em;

            &:hover {
                background-color: rgb(88, 146, 0, 0.8);
            }

            &:active {
                background-color: rgb(88, 146, 0, 0.6);
            }

            
        }

	}
</style>