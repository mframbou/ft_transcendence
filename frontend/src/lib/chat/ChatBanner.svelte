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

    <div class="room-participants">
        {#each room.participants as participant}
            <img class="profile-picture" src={participant.user.profilePicture}/>
        {/each}
    </div>

    <span class="room-name">{room.name}</span>
<!--    <p>-->
<!--        {room.participants.length} user-->
<!--    </p>-->

    {#if room.is_protected}
        <span class="room-protected"/>
    {/if}
<!--    <p style="color:{room.is_private ? 'green' : 'white'};">{room.is_private ? 'private' : 'public'} </p>-->
<!--    <button on:click={pass}>join</button>-->
</div>

<style lang="scss">

    .wrapper
    {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        height: clamp(2rem, 5vw, 3.5rem);
        padding: 0.3rem;
        border-radius: 0.3rem;
        width: 100%;
        gap: 0.3rem;

        background: pink;
    }

    .profile-picture
    {
        aspect-ratio: 1/1;
        border-radius: 20%;
        object-fit: cover;
        height: 65%;
    }

    .room-participants
    {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        gap: 0.3rem;
    }

    .room-name
    {
        font-family: Montserrat;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .room-protected
    {
        margin-left: auto;
        margin-right: 0.3rem;
        height: 40%;
        aspect-ratio: 1/1;

        &:after
        {
            content: url("/images/lock-solid.svg");
        }
    }

</style>