
<script lang="ts">
    import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
    import { goto, prefetchRoutes } from '$app/navigation';

	import Modal from '$lib/Modal.svelte';
    import ChatConfig from '$lib/chat/chatConfig.svelte';


    import Button from '$lib/Button.svelte';
    import ChatBanner from '$lib/chat/ChatBanner.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { writable } from 'svelte/store';
    import { user } from '$lib/stores';
    import { chatSocket } from '../../../lib/websocket-stores';



    // store loaded content
    export let data;

    let chatRooms: any[] = data.chatRooms;
    let currentChatMsgs: any[] = [];
    let headSize = 30;
    let currentChatRoom: any = null;
    let message: string = '';
    let messagesHistoryElement: HTMLDivElement;

    let config = false;


    async function fetchRoomMessage(roomName: string)
    {
        console.log(`Fetching room ${roomName}`);
        const res = await fetch(`/api/chat/rooms?name=${encodeURIComponent(roomName)}`);

        if (res.ok)
        {
            const data = await res.json();
            currentChatRoom = data;
            currentChatMsgs = data.messages.sort((a, b) => a.timestamp - b.timestamp);
            console.log(currentChatMsgs);
        }
        else
        {
            currentChatRoom = null;
            console.log("error");
        }
    }

    function handleKeyDown(event)
    {
        if (event.key === 'Enter')
            sendMessage();
    }

    function sendMessage()
    {
        if (!message)
            return ;
        console.log("sending message : ", message);
        $chatSocket.emit("message", {chatId: currentChatRoom.id, userId: $user.id, content: message});
        message = '';
    }

    async function joinRoom(roomName: string)
    {
        console.log(`Joining room ${roomName}`);
        await fetchRoomMessage(roomName);
        $chatSocket.emit('enter', {chatId: currentChatRoom.id});
    }

    onMount(async () => {
        await getRooms();

        $chatSocket.on("receiveMessage", async (data) => {
            console.log("message received : ", data);
            console.log("sender : ", data.sender);
            currentChatMsgs.push(data);
            currentChatMsgs = currentChatMsgs.sort((a, b) => a.timestamp - b.timestamp); // in case of lag
            await tick(); // https://svelte.dev/tutorial/tick to wait for updates
            messagesHistoryElement.scroll({top: messagesHistoryElement.scrollHeight, behavior: 'smooth'});
        });
    });


</script>

{#if config}
<Modal on:close-modal={() => {config = false}}>
    <ChatConfig />
</Modal>
{/if}

<div class='background'>
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .7, lineColor: '#0097e3', initialCount: 50, maxPoints: 100, maxPointSize: headSize, keyEvent: true}} />
</div>


<div class="wrapper">
    <div class="chatrooms-list">
        <div class="chatrooms-actions">
            <div class="new-chatroom">
                <Button on:click={() => config = true}>New chatroom</Button>
            </div>
        </div>
        {#each chatRooms as room}
            <div class="chatroom">
                <ChatBanner on:click={() => joinRoom(room.name)} room={room} />
            </div>
        {/each}
    </div>
    <div class="current-chat">
        {#if currentChatRoom}
        <div class="chatroom-header">
            <h1 class="chatroom-name">{currentChatRoom.name}</h1>
            <div class="chatroom-actions">
                <Button on:click={() => config = true}>Config</Button>
            </div>
        </div>
        <div class="messages-history" bind:this={messagesHistoryElement}>
            {#each currentChatMsgs as msg}
                <div class="message">
                    {#if msg.isError}
                        <p style="color:red;">{msg.content}</p>
                    {:else if msg.isStatus}
                        <p style="color:gray;">*{msg.content}*</p>
                    {:else}
                        <img class="profile-picture" src={msg.sender.profilePicture}/>
                        <p> {msg.sender.login} </p>
                        <p>: &nbsp</p>
                        <p> {msg.content} </p>
                    {/if}
                </div>
            {/each}
        </div>
        <div class="chat-input">
            <input on:keydown={handleKeyDown} bind:value={message} class="message-input" type="text" placeholder="Type your message here" />
            <button class="send-button" on:click={sendMessage}>Send</button>
        </div>
        {/if}
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


<style lang="scss">

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
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: 0.5rem;

        .messages-history
        {
            overflow-y: auto;

            .message
            {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                background: #2E3B9E;
                padding: 0.5rem;

                .profile-picture
                {
                    border-radius: 20%;
                    object-fit: cover;
                    aspect-ratio: 1/1;
                    width: 1rem;
                }
            }
        }


        .chat-input
        {
            display: flex;
            flex-direction: row;
            margin-top: auto;

            .send-button
            {
                background-color: #2E3B9E;
                color: white;
                border: none;
                border-radius: 0.5rem;
                padding: 0.5rem;
                margin: 0.5rem;
                cursor: pointer;
            }

            .message-input
            {
                flex: 1;
                height: 2rem;
                border: none;
                border-radius: 0.5rem;
                padding: 0.5rem;
                margin: 0.5rem;
                background: #2E3B9E;
                color: white;
            }
        }
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