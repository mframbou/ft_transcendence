
<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { goto, prefetchRoutes } from '$app/navigation';

	import Modal from '$lib/Modal.svelte';
    import ChatConfig from '$lib/chat/chatConfig.svelte';


    import Button from '$lib/Button.svelte';
    import ChatBanner from '$lib/chat/ChatBanner.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { writable } from 'svelte/store';


    // store loaded content
	export let data;

    let chatRooms: any[] = data.chatRooms;
    let headSize = 30;


    let config = false;


    onMount(async () => {
        getRooms();
    });

    async function addRoom() {
        getRooms();
        goto('/chat/config');
    }

    async function joinRoom() {
        
    }

    async function getRooms() {
        let rooms;
        chatRooms = await fetch('/api/chat/rooms').then(res => res.json())

        console.log("rooms : " + JSON.stringify(chatRooms));

        //for (let i = 0; i < rooms.length; i++) {
            //console.log("rooms " + i + " " + rooms[i].participants[0].user.login);
        //}
    }

    async function clearAll() {
        await fetch('/api/chat/clearAll');
        getRooms();
    }

    let unique = {}
    async function feature() {
        headSize = 1000;
        unique = {}
    }

</script>

{#if config}
<Modal on:close-modal={() => {config = false}}>
    <ChatConfig />
</Modal>
{/if}

{#key unique}
<div class='background'>
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .8, lineColor: '#0097e3', initialCount: 50, maxPoints: 127, maxPointSize: headSize, keyEvent: true}} />
</div>
{/key}

<div class="vflex">
    <!-- config panel -->
    <div class="config">
        <Button on:click= {() => {config = true;}}>new chatroom</Button>
        <Button on:click={getRooms}>list room</Button>
        <Button on:click={clearAll}>clear</Button>
        <Button on:click={feature}>useful feature</Button>
    </div>

    <!-- chatRooms list -->
    {#each chatRooms as room}
        <ChatBanner room={room} />
    {/each}
</div>


<style>
    .vflex {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* space between buttons */
        gap: 1rem; 

    }

    .config {
        display: flex;
        flex-direction: row;
        align-items: center;
        /* space between buttons */
        gap: 1rem; 
    }

	.background
	{
		opacity: 0.6;

        color: #0097e3;
		transform: translateZ(-1px);
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>