
<script lang="ts">

    import Button from '$lib/Button.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { user } from '$lib/stores';
    import { chatSocket, pongSocket} from '$lib/websocket-stores';
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte/internal';
    import { flip } from 'svelte/animate';
    import { select_option } from 'svelte/internal';
    import { goto } from '$app/navigation';
    import ChatBanner from '$lib/chat/ChatBanner.svelte';
    import { afterUpdate } from 'svelte';

    // store loaded content
    export let data;

    let msgs: any[] = data.room.messages;
    let message = '';

    // using $user don't work on refresh (why ?)
    onMount(async () => {
        console.log("Mount");
        //console.log("user onMount: " + JSON.stringify($user));
        $chatSocket.emit('enter', {chatId: data.room.id});
    });

    afterUpdate(() => {
        let elem = document.getElementsByClassName("chat");
        elem[0].scrollTop = elem[0].scrollHeight + 500;
    });
    // todo instead of leave in chatSocket disconnect
    //onDestroy(() => {
        //$chatSocket.emit('leave', {roomId: data.room.id});
        //console.log("destroy");
    //});


    async function sendMessage() {
        console.log("user : " + JSON.stringify($user));
        if (!message)
            return ;
        console.log("sending message : ", message);
        await $chatSocket.emit("message", {chatId: data.room.id, userId: $user.id, content: message});
        message = '';
    }

    $chatSocket.on("receiveMessage", (data) => {
        console.log("message received : ", data);
        //console.log("sender : ", data.sender);
        msgs.push(data);
        msgs = msgs;
    });

    $chatSocket.on("commandError", (data) => {
        console.log("commandError : ", data);
        msgs.push({isError: true, content: data});
        msgs = msgs;
    });


    $chatSocket.on("kick", (data) => {
        console.log("kicked");
        goto('/chat');
    });

    $chatSocket.on("duel", (data) => {
        goto ('/home?start_duel=' + data.login);
    });

    // future insane feature
    $chatSocket.on("wizz", (data) => {
        console.log("wizz");
    });

    function onKeyDown(e) {
        switch (e.keyCode) {
            // send message on enter
            case 13:
                sendMessage();
        }
    }

</script>

<div class='background'>
    <ParticlesBackground properties={{minVelocity: 0.4, maxVelocity: .8, lineColor: '#0097e3', initialCount: 50, maxPointSize: 40}} />
</div>

<div class="hflex">
    <div class="chat_container">


            <!-- <h1>Chat</h1> -->
        <!-- {#if $user} -->
        <div class="chat">
            <!-- {#key msgs} -->
                {#each msgs as msg, i}
                    <!-- <div class="messageContainer" style="justify-content: flex-end;"> -->
                  {#if msg.isError || msg.isStatus}
                    <div class="message">
                      <p class:error-message={msg.isError} class:status-message={msg.isStatus}>
                        {msg.content}
                      </p>
                    </div>
                  {:else if !data.user.blockingUsers.find((cur) => cur.blockedLogin === msg.sender?.login)}
                    <div class="message">
                      <img class="profilePicture" src={msg.sender.profilePicture}/>
                      <p> {msg.sender.username} </p>
                      <p class="login" on:click={async () => {await goto(`/profile/${msg.sender.login}`);}}> &nbsp ({msg.sender.login}) </p>
                      <p>: &nbsp</p>
                      <p> {msg.content} </p>
                    </div>
                  {/if}
                {/each}
            <!-- {/key} -->
        </div>
        <!-- <input type="text" id="name" name="name" required autocomplete="off" minlength="4" maxlength="8" size="10" bind={message}> -->
        <!-- {/if} -->
        <div class='hflex'>
            <input on:keypress="{onKeyDown}" bind:value="{message}" type="text" placeholder="message" />
        </div>
    </div>
</div>
<style lang="scss">

    .messageContainer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .error-message
    {
      color: red !important;
    }

    .status-message
    {
      color: gray !important;

      &:before
      {
        content: "*";
      }

      &:after
      {
        content: "*";
      }
    }

    .message {
        display: flex;
        flex-direction: row;
        //width: 80%;
        height: 30px;
        align-items: center;
        margin: 5px;
        padding: 5px;
        border-radius: 5px;
        //background-color: #0097e3;
        color: white;
        //font-size: 1.2em;
        //font-weight: bold;
        p, h3{
            margin: 0;
            padding: 0;
            color : black;
            overflow-x: auto;
            /* chat display */
        }

        p {
            word-wrap: word-break;
        }
    }

    .vflex {
        display: flex;
        flex-direction: column;
        /* chat display */
    }

    .hflex {
        display: flex;
        flex-direction: row;

        align-items:center;
        justify-content: center;
        input {
            width: 100%;
        }
    }

    .message {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        /* chat display */
        p, h3{
            margin: 0;
            padding: 0;
            color : black;
            /* chat display */
        }
    }

    .chat_container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 10px 10px;
        align-items: center;
        //background-color: orange;
		$section-bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);
		//max-height: fit-content;
		margin: 20px;
		padding: 15px;
		gap: 20px;
		background-color: $section-bg-color;
		border-radius: 10px;

        height: 500px;
        width: 1200px;
        //width: 80%;



		// it seems that backdrop filter moves section to the foreground
		backdrop-filter: blur(5px);

        input {
            color: black;
            width: 600px;
        }

    }

    .chat {
        width: 80%;
        height: 80%;
        //background-color: blue;
        justify-content: center;
        text-align: center;
        overflow-y: scroll;
        padding: 10px 10px;
        background-color: rgb(255, 255, 255);


    }

    .error {
        color: red;
    }


        .profilePicture {
            size: inherit;
            //width: 50px;

            //height: 50px;
            //border-radius: 50%;
            //margin: 0;
            //padding: 0;
		    //aspect-ratio: 1;
		    border-radius: 20%;
		    object-fit: cover;
            width: 5%;
        }
    /*.chat {
        width: 50%;
        height: 80%;
        margin-left: auto;
        margin-right: auto;
        align-items: center;
        justify-content: center;

        margin: 5% auto;
        
        border: 1px solid white;
        border-radius: 5px;
        /*height: 300px;

        min-width: 300px;

        overflow-y: scroll;

        background-color: gray;;
    }  */

    .container {
        
        display: flex;
        flex-direction: column;
        width: 50%;
        height: 100%;
        margin-right: auto;
        align-items: center;
        justify-content: center;

        margin: 5% auto;
        
        /*height: 300px;*/

        min-width: 300px;

        overflow-y: scroll;

    }

    section
	{
		$section-bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);
		max-width: 1920px;
		min-height: 9em;
		//max-height: fit-content;
		margin: 20px;
		padding: 15px;
		gap: 20px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		background-color: $section-bg-color;
		border-radius: 10px;

		// it seems that backdrop filter moves section to the foreground
		backdrop-filter: blur(5px);
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

    .login {
        &:hover {
            color: blue;
            cursor: pointer;
        }

    }


</style>




