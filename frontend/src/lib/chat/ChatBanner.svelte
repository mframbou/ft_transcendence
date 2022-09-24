<script lang="ts">
    import Button from "$lib/Button.svelte";
    import ParticlesBackground from "$lib/ParticlesBackground.svelte";

    export let room;
</script>



<div class='wrapper'>

    {#each room.participants as participant}
        <img class="profilePicture" src={participant.user.profilePicture}/>
    {/each}
    <p>
        name: {room.name}
    </p>
    <p>
        public: &nbsp {room.is_private ? '❌' : ' ✓'}
    </p>
    <p>
        {room.participants.length} user
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

        .profilePicture {
            size: inherit;
            //width: 50px;

            //height: 50px;
            //border-radius: 50%;
            //margin: 0;
            //padding: 0;
		    //aspect-ratio: 1;
		    border-radius: 20%;
		    object-fit: cover;
            width: 5%;
        }

	}
</style>