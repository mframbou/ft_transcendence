
<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { goto, prefetchRoutes } from '$app/navigation';
    import { page } from '$app/stores';

	import Modal from '$lib/Modal.svelte';
    import ChatConfig from '$lib/chat/chatConfig.svelte';


    import Button from '$lib/Button.svelte';
    import ChatBanner from '$lib/chat/ChatBanner.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { writable } from 'svelte/store';
    import { user } from '$lib/stores';



    // store loaded content
	export let data;

    let chatRooms: any[] = data.chatRooms;
    let headSize = 30;


    let config = false;


    onMount(async () => {
        await getRooms();

		const mp = $page.url.searchParams.get('mp');

        if (mp) {
            await joinProfileRoom(mp);
        }
    });

    async function addRoom() {
        getRooms();
        goto('/chat/config');
    }

    async function joinProfileRoom(login: string) {
        console.log("try to join profile room");
        const login1 = $user.login;
        const login2 = login;

        // need to add error + security check
        const response = await fetch('/api/chat/joinProfileChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login1: login1,
                login2: login2 // of course login2 is the other user
            })
        });

        console.log("response : ", response);

        if (!response.ok) {
            let json = await response.json();
            console.log("error : ", json.message);
        } else {
            goto('/chat/' + '*' + (login1 < login2 ? login1 + '-' + login2 : login2 + '-' + login1));
        }
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
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .7, lineColor: '#0097e3', initialCount: 50, maxPoints: 60, maxPointSize: headSize, keyEvent: true}} />
</div>
{/key}

<div class="vflex">
    <!-- config panel -->
    <div class="config">
        <Button on:click= {() => {config = true;}}>new chatroom</Button>
        <!-- <Button on:click={clearAll}>clear</Button> -->
        <!-- <Button on:click={feature}>useful feature</Button> -->
        <!-- <Button on:click={joinProfileRoom}>chat with yourself :)</Button> -->
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
		z-index: -1;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>
