
<script lang="ts">
    import Button from '$lib/Button.svelte';
	import { onMount } from 'svelte';
    import { chatSocketStore } from '$lib/stores';
    import { goto, prefetchRoutes } from '$app/navigation';

	export let data;
	console.log(data.chatRooms);

    let chatRooms: any[] = [];

    chatSocketStore.subscribe(() => {});
    let config: boolean = false;


    //onMount(async () => {
        //getRooms(); // fetch chat rooms when we open the page
    //});

    async function addRoom() {

        // send addRoom request
        let ret = await fetch('/api/chat/addRoom', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: 'default', is_private: false})//, password: 'default'})
        });

        console.log(ret ? 'room added' : 'room not added');
    }

    async function getRooms() {
        let rooms;
        rooms = await fetch('/api/chat/rooms').then(res => res.json())

        console.log("rooms : " + JSON.stringify(rooms));

    }

    // return participents in a room based on room id
    async function getParticipants(roomId: number){
    }

    function clearAll() {
        fetch('/api/chat/clearAll');
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

<div class="vflex">
    <Button on:click={addRoom}>add room</Button>
    <Button on:click={getRooms}>list room</Button>
    <!-- <Button on:click={getParticipants}>list all participants</Button> -->
    <Button on:click={clearAll}>clear</Button>
</div>

{#each chatRooms as room}
    <div>
        <Button on:click={() => {joinRoom(room)}}>room {room}</Button>
    </div>
{/each}


<style>
    .vflex {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* space between buttons */
        gap: 1rem; 

    }
</style>