<script lang="ts">

	import { onMount} from "svelte";

    
    let canvasElement:HTMLCanvasElement;
    let context:CanvasRenderingContext2D;

    onMount(async () =>
    {
			canvasElement.addEventListener("mousemove",movePaddle);

            if(canvasElement.getContext("2d") != null)
                context = canvasElement.getContext("2d") as CanvasRenderingContext2D;
            else
                console.log("context is null");
			
            // pongSocket.on('', (data) => {
            //     console.log('pongSocket received pong', data);
            // });

            // pongSocket.on('onStartGameReceive', (data) => {
            //     console.log('pongSocket received pong', data);
            // });

            // pongSocket.on('onStartGameReceive', (data) => {
            //     console.log('pongSocket received pong', data);
            // });
			requestAnimationFrame(game);
	})

    const computerLevel = 50;

    const canvas_width = 600;
    const canvas_height = 400;
    const paddle_width =  10;
    const paddle_height = 100;
    const paddle_color = "black";


    const framePerSecond = 50;

    const user =
        {
            x : 0,
            y : (canvas_height/2) - (paddle_height/2),
            width : paddle_width,
            height : paddle_height,
            color : "blue",
            score : 0
        }
    const com =
        {
            x : canvas_width - paddle_width,
            y : (canvas_height/2) - (paddle_height/2),
            width : paddle_width,
            height : paddle_height,
            color : "red",
            score : 0,
            random : 0
        }

    const net =
        {
            x : canvas_width/2 - 2,
            y : 0,
            width : 4,
            height : 10,
            color : "white",
        }


    const ball = {

        x : canvas_width/2,
        y : canvas_height/2,
        radius : 10,
        speed : 5,

        velocityX : 5,
        velocityY : 5,
        color : "white",
    }

    function drawRect(x:number, y:number, w:number, h:number, color:string)
    {
        context.fillStyle = color;
        context.fillRect(x,y,w,h);
    }

    function drawCircle(x:number, y:number,r: number ,color:string)
    {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x,y,r,Math.PI*2,0,false);
        context.closePath();
        context.fill();

    }

    function drawText(text:string, x:number,y:number,color:string)
    {
        context.fillStyle = color;
        context.font = "75px fantasy"
        context.fillText(text,x,y);
    }


    function reset_canvas()
    {
        drawRect(0,0,600,400,"black");
    }

    function drawNet()
    {
        for(let i = 0; i < canvas_height; i+=20)
            drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }

    function drawBall()
    {
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }

    function drawScore()
    {
        drawText(user.score.toString(),canvas_width/4,canvas_height/5,"white");
        drawText(com.score.toString(),3*canvas_width/4,canvas_height/5,"white");
    }

    function resetBall()
    {
        ball.x = canvas_width/2;
        ball.y = canvas_height/2;
        ball.speed = 5;
        ball.velocityX = -ball.velocityX;
        com.random = 0;
    }

    function movePaddle(event:MouseEvent)
    {
        let rect = canvasElement.getBoundingClientRect();
        user.y = event.clientY - rect.top - user.height/2;
        if(user.y + paddle_height > canvas_height)
            user.y = canvas_height - paddle_height;
        if(user.y < 0)
            user.y = 0;
         
    }

    function Update()
    {
        com.y = ball.y -  com.height/2 + com.random;

        if(com.y + paddle_height > canvas_height)
            com.y = canvas_height - paddle_height;
        if(com.y < 0)
            com.y = 0;

        if(ball.x + ball.radius > canvas_width)
        {
            user.score++;
            resetBall();
        }
        else if(ball.x - ball.radius < 0)
        {
            com.score++;
            resetBall();
        }

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if(ball.y + ball.radius > canvas_height || ball.y - ball.radius < 0)
        {
            ball.velocityY = -ball.velocityY;
        }


        let player = (ball.x < canvas_width/2) ? user : com;
        if(collision(ball,player))
        {
            let collidPoint = (ball.y - (player.y + player.height/2));
            collidPoint = collidPoint/(player.height/2);
            let angleRad = (Math.PI/4) * collidPoint;
            let direction = (ball.x < canvas_width/2) ? 1 : -1;
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = direction * ball.speed * Math.sin(angleRad);
            ball.speed += 0.2;

            if(player == com)
                com.random = Math.random()  * computerLevel ;
        }
    }

    function collision(ball:any, player:any)
    {
        ball.top = ball.y - ball.radius;
        ball.bottom = ball.y + ball.radius;
        ball.left = ball.x - ball.radius;
        ball.right = ball.x + ball.radius;

        player.top = player.y;
        player.bottom = player.y + player.height;
        player.left = player.x;
        player.right = player.x + player.width;

        return ball.right > player.left && ball.bottom > player.top && ball.left < player.right && ball.top < player.bottom;
    }

    function render()
    {
        reset_canvas();
        drawScore();
        drawNet();
        drawRect(user.x,user.y,user.width,user.height,user.color);
        drawRect(com.x,com.y,com.width,com.height,com.color);
        drawBall();
    }

    function game()
    {

        Update();
        //UpdateClient();
        render();
        requestAnimationFrame(game);
    }

</script>

<canvas bind:this={canvasElement} width="600" height="400"/>