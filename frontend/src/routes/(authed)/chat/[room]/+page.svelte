
<script lang="ts">

    import Button from '$lib/Button.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { user } from '$lib/stores';
    import { chatSocket } from '$lib/websocket-stores';
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte/internal';
    import { flip } from 'svelte/animate';
    import { select_option } from 'svelte/internal';


    // store loaded content
    export let data;
    //console.log("data : " + JSON.stringify(data));
    //console.log("message : ", data.room.messages);
    //let msgs: any[] = [...data.room.messages]; 
    let msgs: any[] = data.room.messages;

    let message = '';

    //for (let i = 0; i < 12; i++) {
        //msgs.push({user:(Math.random() + 1).toString(36).substring(7), msg:(Math.random() + 1).toString(36).substring(7)});
    //}
    ////msgs.push({senderId:$user , content:(Math.random() + 1).toString(36).substring(7)});
    //console.log("data : " + JSON.stringify(data));

    onMount(async () => {
        console.log("Mount");
        $chatSocket.emit('enter', {roomId: data.room.id});
    });

    // todo instead of leave in chatSocket disconnect
    //onDestroy(() => {
        //$chatSocket.emit('leave', {roomId: data.room.id});
        //console.log("destroy");
    //});




    async function sendMessage() {
        if (!message)
            return ;
        console.log("sending message : ", message);
        await $chatSocket.emit("message", {chatId: data.room.id, userId: $user.id, content: message});
        message = '';
    }

    let cnt = 0;
    $chatSocket.on("receiveMessage", (data) => {
        console.log("cnt : ", cnt++);
        console.log("message received : ", data);
        console.log("sender : ", data.sender);
        msgs.push(data);
        msgs = msgs;

        // don't scroll to the bottom for some reason
        let elem = document.getElementsByClassName("chat");
        console.log("elem : ", elem[0].scrollHeight);
        elem[0].scrollTop = elem[0].scrollHeight;
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

<section class="chat_container">

        <!-- <h1>Chat</h1> -->
    <!-- {#if $user} -->
    <div class="chat">
        <!-- {#key msgs} -->
            {#each msgs as msg, i}
                <div class="message">
                    <!-- {#if msg.user === $user.login}
                    <div class='hflex' style="justify-content: flex-end;">
                            <p>{msg.content} {msg.user}</p>
                    </div> 
                    {:else} -->
                        <img class="profilePicture" src={msg.sender.user.profilePicture}/>
                        <p>  {msg.sender.user.login}: {msg.content} </p>
                    <!-- {/if} -->
                </div>
            {/each}
        <!-- {/key} -->
    </div>
    <!-- <input type="text" id="name" name="name" required autocomplete="off" minlength="4" maxlength="8" size="10" bind={message}> -->
    <!-- {/if} -->
    <div class='hflex'>
        <input on:keypress="{onKeyDown}" bind:value="{message}" type="text" placeholder="message" />
    </div>
</section>
<style lang="scss">
    .vflex {
        display: flex;
        flex-direction: column;
        /* chat display */
    }

    .hflex {
        display: flex;
        flex-direction: row;

        align-items:center;
        /* chat display */
        input {
            height: 30%;
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
        max-height: 300px;
        padding: 10px 10px;
        align-items: center;
        //background-color: orange;

    }

    .chat {
        width: 50%;
        //background-color: blue;
        justify-content: center;
        text-align: center;
        overflow-y: scroll;
        padding: 10px 10px;
        background-color: rgb(255, 255, 255);


    }

    input {
        color: black;
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
        height: 80%;
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
		max-height: fit-content;
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


</style>




