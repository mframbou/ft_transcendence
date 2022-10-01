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

    let error = '';

    async function pass() {
        error = '';
        password = '';

        // if already in room go to chat
        if (room.participants.find(p => p.user.login === $user.login)) {
            goto('/chat/' + room.name);
            return ;
        } 

        if (!room.is_protected) {
            await joinRoom();
            return ;
        } else {  
            passwordPanel = true;
        }
    }

    async function joinRoom() {
        console.log("try to join room");

        // need to add error + security check
        const response = await fetch('/api/chat/joinRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: room.id,
                password: password
            })
        });

        console.log("response : ", response);

        if (!response.ok) {
            //console.log("error : ", response);
            let json = await response.json();
            error = json.message;
        } else {
            goto('/chat/' + room.name);
        }

        //const json = await response.json();
        //console.log("response in joinRoom : ", json);

        //if (room.is_private) {
            //passwordPanel = true;
        //} else {
            //goto('/chat/' + room.name);
        //}
    }

</script>

{#if passwordPanel}
    <Modal on:close-modal={() => {passwordPanel = false}}>
        <div class='vflex'>
            <h3 style = 'background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;'>Enter password</h3>
        <input class="test" type="password" bind:value={password} style="color:black" />
        <Button on:click={joinRoom} on:click={() => {passwordPanel = false}}>OK</Button>
        </div>
    </Modal>
{/if}

{#if error}
    <Modal on:close-modal={() => {error = ''}}>
        <p>{error}</p>
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
        {room.participants.length} user
    </p>
    <p>
        {room.is_protected ? '🔒' : ' 🔓'}
    </p>
    <p style="color:{room.is_private ? 'green' : 'white'};">{room.is_private ? 'private' : 'public'} </p>
    <button on:click={pass}>join</button>
</div>

<style lang="scss">
    .hflex {
        display: flex;
        flex-direction: row;

    }

    .vflex {
        display: flex;
        flex-direction: column;

        gap: 0.5rem;
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

        .🌈 {
            background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
	    }
	}
</style>