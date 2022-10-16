

<script lang="ts">
    import { goto } from "$app/navigation";
    import Modal from "$lib/Modal.svelte";

    let name: string = '';
    let password: string = '';
    let is_private: boolean = false;
    let is_protected: boolean = false;

    let error: string = '';

    async function addRoom() {
        // addRoom request return a true/false

        const response = await fetch('/api/chat/addRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name, is_protected: is_protected, is_private: is_private, password: password})
        });

        console.log("response : ", response);

        const json = await response.json();

        if (response.ok) {
            goto('/chat/' + name);
        } else {
            error = json.message;
        }
    } 
</script>

<div class='vflex'>
    <!-- <h1>ugly ChatRoom configuration</h1> -->

    {#if error}
    <Modal on:close-modal={() => {error = ''}}>
        <div class="error">
            <h3>Error</h3>

            <!-- <p >Another room have the same name</p> -->
            <p> {error} </p>
        </div>
    </Modal>
    {/if}

    <h2 class='🌈'>Create room</h2>
    <div class='vflex'>
        name <input type="text" bind:value={name}>
        password <input type="password" bind:value={password} disabled={!is_protected}>

        <div class="checkBox"> 
            <input type=checkbox bind:checked={is_protected} disabled={is_private}> <p>protected</p> 
            <input type=checkbox bind:checked={is_private} disabled={is_protected}> <p>private</p> 
        </div> 

        <button on:click={addRoom}>create</button>
    </div>
</div>

<!-- good css to be done -->
<style lang="scss">
    .hflex {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: flex-end;

        input {
            width: 30%;
            height: 2em;


            font-size: 1em;
            
            margin: 0;
            padding: 1%;

            color: black;
        }
    }

    .vflex {
        display: flex;
        flex-direction: column;
        gap: 15px;

        align-items: center;
    }


    button {
        //position: absolute;
        right: 10px;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 40px;
        background-color: rgb(88, 146, 0);
        border-radius: 5px;
        color: white;
        font-size: 1.0em;

        &:hover {
            background-color: rgb(88, 146, 0, 0.8);
        }

        &:active {
            background-color: rgb(88, 146, 0, 0.6);
        }
    }

    input {
        color: black;
        height: 1.2em;
        font-size: 1.0rem;
    }

    .checkBox {
        display: flex;
        flex-direction: row;

        align-items: flex-end;

        input {
            background-color: rgb(88, 146, 0);

            color: black;
        }
    }

    .error {
        display: flex;
        flex-direction: column;
        gap: 10px;

        align-items: center;

        h3 {
            color: red;
        }

        p {
            color: white;
        }
    }
    
    .🌈 {
        background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
	}

</style>