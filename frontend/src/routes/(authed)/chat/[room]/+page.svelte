
<script lang="ts">

    import Button from '$lib/Button.svelte';
    import ParticlesBackground from '$lib/ParticlesBackground.svelte';
    import { user } from '$lib/stores';
    import { chatSocket } from '$lib/websocket-stores';
    import { onMount } from 'svelte';
    import { flip } from 'svelte/animate';

    chatSocket.subscribe(value => {
        console.log("chatSocket : ", value);
    });

    // store loaded content
    export let data;
    console.log("data : " + JSON.stringify(data));
    console.log("message : ", data.room.messages);
    //let msgs: any[] = [...data.room.messages]; 
    let msgs: any[] = data.room.messages;

    let message = '';

    //for (let i = 0; i < 12; i++) {
        //msgs.push({user:(Math.random() + 1).toString(36).substring(7), msg:(Math.random() + 1).toString(36).substring(7)});
    //}
    ////msgs.push({senderId:$user , content:(Math.random() + 1).toString(36).substring(7)});
    //console.log("data : " + JSON.stringify(data));

    async function sendMessage() {
        if (!message)
            return ;
        console.log("sending message : ", message);
        await $chatSocket.emit("message", {chatId: data.room.id, userId: $user.id, content: message});
        message = '';
    }

    $chatSocket.on("receiveMessage", (data) => {
        console.log("message received : ", data);
        console.log("sender : ", data.sender);
        msgs.push(data);
        msgs = msgs;
    });

    // future insane feature
    $chatSocket.on("wizz", (data) => {
        console.log("wizz");
    });

</script>

<section class="chat_container">

        <!-- <h1>Chat</h1> -->
    <!-- {#if $user} -->
    <div class="chat">
        <!-- {#key msgs} -->
            {#each msgs as msg, i}
                <div class="msg">
                    <!-- {#if msg.user === $user.login}
                    <div class='hflex' style="justify-content: flex-end;">
                            <p>{msg.content} {msg.user}</p>
                    </div> 
                    {:else} -->
                        <div class='hflex' style="justify-content: flex-start; ">
                        <img class="profilePicture" src={msg.sender.user.profilePicture}/>
                        <p>  {msg.sender.user.login} {msg.content} </p>
                        </div>
                    <!-- {/if} -->
                </div>
            {/each}
        <!-- {/key} -->
    </div>
    <!-- <input type="text" id="name" name="name" required autocomplete="off" minlength="4" maxlength="8" size="10" bind={message}> -->
    <!-- {/if} -->
    <div class='hflex'>
        <input type="text" bind:value={message}>
        <Button on:click={sendMessage}>Send</Button>
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

        p {
            color: black;
        }

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




