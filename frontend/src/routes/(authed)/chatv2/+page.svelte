
<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { goto, prefetchRoutes } from '$app/navigation';

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
        getRooms();
    });

    async function addRoom() {
        getRooms();
        goto('/chat/config');
    }

    async function joinProfileRoom() {
        console.log("try to join profile room");

        // need to add error + security check
        const response = await fetch('/api/chat/joinProfileChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login1: $user.login,
                login2: $user.login // of course login2 is the other user
            })
        });

        console.log("response : ", response);

        if (!response.ok) {
            let json = await response.json();
            console.log("error : ", json.message);
        } else {
            goto('/chat/' + '*' + ($user.login < 'dsamain' ? $user.login + '-' + 'dsamain' : 'dsamain' + '-' + $user.login));
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
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .7, lineColor: '#0097e3', initialCount: 50, maxPoints: 100, maxPointSize: headSize, keyEvent: true}} />
</div>
{/key}


<div class="wrapper">
    <div class="chatrooms-list">
        <div class="chatrooms-actions">
            <div class="new-chatroom">
                <Button on:click={() => config = true}>New chatroom</Button>
            </div>
        </div>
        {#each chatRooms as room}
            <div class="chatroom">
                <ChatBanner room={room} />
            </div>
        {/each}
    </div>
    <div class="current-chat">
    </div>
</div>

<!--<div class="vflex">-->
<!--    &lt;!&ndash; config panel &ndash;&gt;-->
<!--    <div class="config">-->
<!--        <Button on:click= {() => {config = true;}}>new chatroom</Button>-->
<!--        <Button on:click={clearAll}>clear</Button>-->
<!--        <Button on:click={feature}>useful feature</Button>-->
<!--        <Button on:click={joinProfileRoom}>chat with yourself :)</Button>-->
<!--    </div>-->

<!--    &lt;!&ndash; chatRooms list &ndash;&gt;-->
<!--    {#each chatRooms as room}-->
<!--        <ChatBanner room={room} />-->
<!--    {/each}-->
<!--</div>-->


<style>

    .wrapper
    {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        height: 100%;
    }

    @media (max-width: 859px)
    {
        .chatrooms-list
        {
            display: none;
        }
    }

    @media (min-width: 860px)
    {
        .chatrooms-list
        {
            display: flex;
        }
    }

    .chatrooms-list
    {
        flex: 1;
        background-color: red;
        overflow-y: scroll;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    .new-chatroom
    {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }

    .current-chat
    {
        flex: 3;
        background-color: blue;
        overflow-y: scroll;
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