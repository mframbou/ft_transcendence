<script lang="ts">
    import { goto } from '$app/navigation';
    import { user } from '$lib/stores';

    import Button from "$lib/Button.svelte";
    import ParticlesBackground from "$lib/ParticlesBackground.svelte";
    import Modal from "$lib/Modal.svelte";
    import PasswordPanel from './passwordPanel.svelte';

    export let room;


    let passwordPanel = false; 
    let password = '';

    async function pass() {
        password = '';
        if (!room.is_private) {
            await joinRoom();
            return ;
        } else {  
            passwordPanel = true;
        }
    }

    async function joinRoom() {
        console.log("Joining room");

        // need to add error + security check
        const response = await fetch('/api/chat/joinRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: room.id,
                userId: $user.id,
                password: password
            })
        });

        //const json = await response.json();
        console.log("response in joinRoom : ", response);

        //if (room.is_private) {
            //passwordPanel = true;
        //} else {
            //goto('/chat/' + room.name);
        //}
    }

</script>

{#if passwordPanel}
    <Modal on:close-modal={() => {passwordPanel = false}}>
        <input class="test" type="text" bind:value={password} style="color:black" />
        <Button on:click={joinRoom} on:click={() => {passwordPanel = false}}>OK</Button>
    </Modal>
{/if}

<div class='wrapper'>

    {#each room.participants as participant}
        <img class="profilePicture" src={participant.user.profilePicture}/>
    {/each}
    <p>
        name: &nbsp {room.name}
    </p>
    <p>
        public: &nbsp {room.is_private ? '❌' : ' ✓'}
    </p>
    <p>
        {room.participants.length} user
    </p>
    <button on:click={pass}>join</button>
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

        .test {
            color: black;
            height: 1000%;
        }

        input {
            color:black;
        }

	}
</style>