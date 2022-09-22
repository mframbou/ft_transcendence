
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
        fetch('/api/chat/rooms')
            .then((res) => {
                return res.json();
            }).then(res => {
                console.log("room list : " + JSON.stringify(res));
            }); 
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

<Button on:click={addRoom}>Create New Chat Room</Button>
<Button on:click={getRooms}>getList</Button>

{#each chatRooms as room}
    <div>
        <Button on:click={() => {joinRoom(room)}}>room {room}</Button>
    </div>
{/each}

