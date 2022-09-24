
<script lang="ts">
	import { onMount } from 'svelte';
    import { chatSocketStore } from '$lib/stores';
    import { goto, prefetchRoutes } from '$app/navigation';

    import Button from '$lib/Button.svelte';
    import ChatBanner from '$lib/chat/ChatBanner.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';


    // store loaded content
	export let data;

    // chatSocket
    chatSocketStore.subscribe(() => {});

    let chatRooms: any[] = data.chatRooms;
    let headSize = 30;





    onMount(async () => {
        getRooms();
    });

    async function addRoom() {
        getRooms();
        goto('/chat/config');
    }

    async function getRooms() {
        let rooms;
        chatRooms = await fetch('/api/chat/rooms').then(res => res.json())

        console.log("rooms : " + JSON.stringify(chatRooms));

        //for (let i = 0; i < rooms.length; i++) {
            //console.log("rooms " + i + " " + rooms[i].participants[0].user.login);
        //}
    }

    // return participents in a room based on room id
    async function getParticipants(roomId: number){
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

    // SOCKET
    //function joinRoom(id: string) {
        //console.log("JOIN ROOM: " + id);
        //$chatSocketStore.emit('joinRoom', id);
    //}

    //$chatSocketStore.on('joinedRoom', (data) => {
        //goto('/chat/' + data);
    //});

    // probably better to fetch ? 

    //console.log("socket : " + chatSocketStore);

</script>


{#key unique}
<div class='background'>
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .8, lineColor: '#0097e3', initialCount: 50, maxPointSize: headSize}} />
</div>
{/key}

<div class="vflex">
    <!-- config panel -->
    <div class="config">
        <Button on:click={addRoom}>add room</Button>
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