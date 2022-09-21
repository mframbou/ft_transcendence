
<script lang="ts">
    import Button from '$lib/Button.svelte';
	import { onMount } from 'svelte';
    import { chatSocketStore } from '../../../lib/stores';
    import { goto } from '$app/navigation';

    let chatRooms: any[] = [];

    chatSocketStore.subscribe(() => {});
    let config: boolean = false;

    function createNewChatRoom() {
        $chatSocketStore.emit('createRoom', {name: 'default', password: 'default'});
        config = true;
    }

    $chatSocketStore.on('onRoomCreated', (roomId) => {
        console.log("ROOM CREATED: " + roomId);
        getList();
    });

    // later, the id should only be know by the server
    function joinRoom(id: string) {
        console.log("JOIN ROOM: " + id);
        $chatSocketStore.emit('joinRoom', id);
    }

    $chatSocketStore.on('joinedRoom', (data) => {
        goto('/chat/' + data);
    });

    // probably better to fetch ? 
    function getList() {
        $chatSocketStore.emit('getRooms', '');

    }

    $chatSocketStore.on('onRoomsList', (roomList) => {
        console.log('bonjoir');
        chatRooms = roomList;
        console.log("chat rooms : ", chatRooms);
    }); 

    console.log("socket : " + chatSocketStore);
</script>

<Button on:click={createNewChatRoom}>Create New Chat Room</Button>
<Button on:click={getList}>getList</Button>

{#each chatRooms as room}
    <div>
        <Button on:click={() => {joinRoom(room)}}>room {room}</Button>
    </div>
{/each}

