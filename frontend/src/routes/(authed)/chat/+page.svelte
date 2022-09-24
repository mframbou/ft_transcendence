
<script lang="ts">
    import Button from '$lib/Button.svelte';
	import { onMount } from 'svelte';
    import { chatSocketStore } from '$lib/stores';
    import { goto, prefetchRoutes } from '$app/navigation';

    import ChatBanner from '$lib/chat/ChatBanner.svelte';

    // store loaded content
	export let data;

    let chatRooms: any[] = data.chatRooms;

    chatSocketStore.subscribe(() => {});
    let config: boolean = false;


    onMount(async () => {
        
    });

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
        getRooms();
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
    <div class="config">
        <Button on:click={addRoom}>add room</Button>
        <Button on:click={getRooms}>list room</Button>
        <!-- <Button on:click={getParticipants}>list all participants</Button> -->
        <Button on:click={clearAll}>clear</Button>
    </div>

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
</style>