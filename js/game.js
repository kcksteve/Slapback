let app;

const basePlayerSpeed = 40;
const chargedPlayerSpeed = 60;
const fullPlayerCharge = 6;
const playAreaOffset = 20;
const paddleYGap = 10;
const netDivTopY = 200;
const netDivBotY = 400;
const netXoffset = 30;

let p1;
let p1Score;
let p1ScoreTxt;
let p1Speed;
let p1Charge;
let p1TopNet;
let p1MidNet;
let p1BotNet;

let p2;
let p2Score;
let p2ScoreTxt;
let p2Speed;
let p2Charge;
let p2TopNet;
let p2MidNet;
let p2BotNet;

let lastPlayerScored = 0;

let bgSprite;
let ballSprite;
let ballAngle;
let ballState = 0;
let ballStuck = 0;
let ballSpeedState;
const ballSpeeds = [12, 20, 22, 30];

let gameRunning;
let keys = {};
let keysPressed = {};

//Setup after loading
window.onload = () => {
    app = new PIXI.Application(
        {
            width: 800,
            height: 600,
            backgroundColor: 0x0D0D0D
        }
    );
    
    //Add pixi to body
    document.body.appendChild(app.view);

    //SetupFunctions
    setupUI();
    setupPlayers();
    setupLevel();
    startRound();

    window.addEventListener("keypress", keysPress);
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    app.ticker.add(gameLoop);
}

//Setup player paddles and data
let setupPlayers = () => {
    const offsetFromEdge = 56;

    //Setup player 1
    p1 = new PIXI.Sprite.from("images/Paddle.png");
    p1.anchor.set(0.5);
    p1.x = p1.width / 2 + offsetFromEdge;
    p1.y = app.view.height / 2;
    p1.zIndex = 11;
    app.stage.addChild(p1);
    p1Score = 0;
    p1Charge = 0;

    //Setup player 2
    p2 = new PIXI.Sprite.from("images/Paddle.png");
    p2.anchor.set(0.5);
    p2.x = app.view.width - offsetFromEdge + p2.width / 2;
    p2.y = app.view.height / 2;
    p2.zIndex = 10;
    app.stage.addChild(p2);
    p2Score = 0;
    p2Charge = 0;
}

//Setup play area
let setupLevel = () => {
    bgSprite = new PIXI.Sprite.from("images/PlayArea.png");
    bgSprite.anchor.set(0.5);
    bgSprite.x = app.view.width / 2;
    bgSprite.y = app.view.height / 2;
    bgSprite.zIndex = 0;
    app.stage.addChild(bgSprite);

    const netTopY = 114;
    const netBotY = 486;

    p1TopNet = new PIXI.Sprite.from("images/Net.png");
    p1TopNet.anchor.set(0.5);
    p1TopNet.x = netXoffset;
    p1TopNet.y = netTopY;
    p1TopNet.zIndex = 0;
    app.stage.addChild(p1TopNet);

    p1MidNet = new PIXI.Sprite.from("images/Net.png");
    p1MidNet.anchor.set(0.5);
    p1MidNet.x = netXoffset;
    p1MidNet.y = app.view.height / 2;
    p1MidNet.zIndex = 0;
    app.stage.addChild(p1MidNet);

    p1BotNet = new PIXI.Sprite.from("images/Net.png");
    p1BotNet.anchor.set(0.5);
    p1BotNet.x = netXoffset;
    p1BotNet.y = netBotY;
    p1BotNet.zIndex = 0;
    app.stage.addChild(p1BotNet);

    p2TopNet = new PIXI.Sprite.from("images/Net.png");
    p2TopNet.anchor.set(0.5);
    p2TopNet.x = app.view.width - netXoffset;
    p2TopNet.y = netTopY;
    p2TopNet.zIndex = 0;
    app.stage.addChild(p2TopNet);

    p2MidNet = new PIXI.Sprite.from("images/Net.png");
    p2MidNet.anchor.set(0.5);
    p2MidNet.x = app.view.width - netXoffset;
    p2MidNet.y = app.view.height / 2;
    p2MidNet.zIndex = 0;
    app.stage.addChild(p2MidNet);

    p2BotNet = new PIXI.Sprite.from("images/Net.png");
    p2BotNet.anchor.set(0.5);
    p2BotNet.x = app.view.width - netXoffset;
    p2BotNet.y = netBotY;
    p2BotNet.zIndex = 0;
    app.stage.addChild(p2BotNet);
}

//Setup game playe ui
let setupUI = () => {
    const scoreTxtXOffset = 10;
    const scoreTxtY = 100;
    const scoreTxtStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 60,
        fontFamily: "thirteenPixels"
    })

    //Setup p1 score counter
    p1ScoreTxt = new PIXI.Text("0");
    p1ScoreTxt.x = app.view.width / 2 - scoreTxtXOffset;
    p1ScoreTxt.y = scoreTxtY;
    p1ScoreTxt.anchor.set(1);
    p1ScoreTxt.style = scoreTxtStyle;
    app.stage.addChild(p1ScoreTxt);

    //Setup p2 score counter
    p2ScoreTxt = new PIXI.Text("0");
    p2ScoreTxt.x = app.view.width / 2 + scoreTxtXOffset + 5;
    p2ScoreTxt.y = scoreTxtY;
    p2ScoreTxt.anchor.x = 0;
    p2ScoreTxt.anchor.y = 1;
    p2ScoreTxt.style = scoreTxtStyle;
    app.stage.addChild(p2ScoreTxt);
}


//Create a ball
let createBall = () => {
    if (ballSprite != null){
        ballSprite.destroy();
    }

    ballSprite = new PIXI.Sprite.from("images/Ball.png");
    ballSprite.anchor.set(0.5);
    ballSprite.x = app.view.width / 2;
    ballSprite.y = (app.view.height / 2 - 100) + Math.floor(Math.random() * 200);
    ballSprite.zIndex = 20;
    app.stage.addChild(ballSprite);
    ballState = 1;
    ballSpeedState = 0;

    if (lastPlayerScored == 0){
        randAngle = Math.floor(Math.random() * 4)

        switch (randAngle) {
            case 0:
                ballAngle = 45;
                break;
            case 1:
                ballAngle = 135;
                break;
            case 2:
                ballAngle = 225;
                break;
            case 3:
                ballAngle = 315;
                break;
        }
    }
    else if (lastPlayerScored == 1){
        randAngle = Math.floor(Math.random() * 2)

        switch (randAngle) {
            case 0:
                ballAngle = 135;
                break;
            case 1:
                ballAngle = 225;
                break;
        }
    }
    else {
        randAngle = Math.floor(Math.random() * 2)

        switch (randAngle) {
            case 0:
                ballAngle = 45;
                break;
            case 1:
                ballAngle = 315;
                break;
        }
    }
}

let moveBall = () => {
    if (ballStuck == 0){
        let ballOffsetX;
        let ballOffsetY;

        switch (ballAngle) {
            case 0:
                ballOffsetX = ballSpeeds[ballSpeedState];
                ballOffsetY = 0;
                break;
            case 45:
                ballOffsetX = ballSpeeds[ballSpeedState];
                ballOffsetY = ballSpeeds[ballSpeedState];
                break;
            case 135:
                ballOffsetX = ballSpeeds[ballSpeedState] * -1;
                ballOffsetY = ballSpeeds[ballSpeedState];
                break;
            case 180:
                ballOffsetX = ballSpeeds[ballSpeedState] * -1;
                ballOffsetY = 0;
                break;
            case 225:
                ballOffsetX = ballSpeeds[ballSpeedState] * -1;
                ballOffsetY = ballSpeeds[ballSpeedState] * -1;
                break;
            case 315:
                ballOffsetX = ballSpeeds[ballSpeedState];
                ballOffsetY = ballSpeeds[ballSpeedState] * -1;
                break;
            default:
                ballOffsetX = 0;
                ballOffsetY = 0;
                break;
        }

        targetX = ballSprite.x + ballOffsetX * (app.ticker.deltaMS * 0.01);
        targetY = ballSprite.y + ballOffsetY * (app.ticker.deltaMS * 0.01);

        ballSprite.x = checkBallX(targetX, targetY);
        ballSprite.y = checkBallY(targetY);
    }
    
}

//Check ball location for bounce
let checkBallY = (y) => {
    if (ballSprite.y - ballSprite.height / 2 <= playAreaOffset + 3){
        if (ballAngle == 225){
            ballAngle = 135;
        }
        else {
            ballAngle = 45;
        }
        return playAreaOffset + 4 + ballSprite.height / 2;
    } 
    else if (ballSprite.y + ballSprite.height / 2 >= app.view.height - playAreaOffset - 3){
        if (ballAngle == 135){
            ballAngle = 225;
        }
        else {
            ballAngle = 315;
        }
        return app.view.height - playAreaOffset - 4 - ballSprite.height / 2;
    }
    else{
        return y;
    }
}

//Check ball location for stick or score
let checkBallX = (x, y) => {
    let ballTop = y - ballSprite.height / 2;
    let ballBot = y + ballSprite.height / 2;
    let paddleToCheck; 
    let paddleIsPlayer;
    let paddleFaceX;
    let ballLocToStick;


    if (ballAngle == 135 || ballAngle == 180 || ballAngle == 225){
        paddleToCheck = p1;
        paddleIsPlayer = 1;
        paddleFaceX = p1.x + p1.width / 2;
        ballLocToStick = (p1.x + p2.width / 2) + (ballSprite.width / 2);
    }
    else{
        paddleToCheck = p2;
        paddleIsPlayer = 2;
        paddleFaceX = p2.x - p2.width / 2;
        ballLocToStick = (p2.x - p2.width / 2) - (ballSprite.width / 2);
    }

    let paddleTop = paddleToCheck.y - paddleToCheck.height / 2;
    let paddleBot = paddleToCheck.y + paddleToCheck.height / 2;

    if ((ballBot > paddleTop && ballBot < paddleBot) || (ballTop < paddleTop && ballTop > paddleBot)){
        if (ballState == 1){
            if (paddleIsPlayer == 1 && x - ballSprite.width / 2 <= paddleFaceX){
                ballStuck = paddleIsPlayer;
                return ballLocToStick;
            }
            else if(paddleIsPlayer == 2 && x + ballSprite.width / 2 >= paddleFaceX){
                ballStuck = paddleIsPlayer;
                return ballLocToStick;
            }
            else{
                return x;
            }
        }
    }

        if (ballState == 1){
            if (paddleIsPlayer == 1 && x - ballSprite.width / 2 <= paddleFaceX){
                ballState = 2;
                return x;
            }
            else if(paddleIsPlayer == 2 && x + ballSprite.width / 2 >= paddleFaceX){
                ballState = 2;
                return x;
            }
            else{
                return x;
            }
        }
        else{
            if (paddleIsPlayer == 1 && x <= netXoffset){
                playerScore(2, ballSprite.y);
                return x;
            }
            else if(paddleIsPlayer == 2 && x >= app.view.width - netXoffset){
                playerScore(1, ballSprite.y);
                return x;
            }
            else{
                return x;
            }
        }




}

//Update ball based on it's state 0=NoneInPlay, 1=InPlay, 2=Scored
let updateBall = () => {
    switch (ballState) {
        case 0:
            createBall();
            break;
        case 1:
            moveBall();
            break;
        case 2:
            moveBall();
            break;
    }
}

//Start a round
let startRound = () => {
    gameRunning = true;
}

let playerScore = (player, ballY) => {
    const pointsTopBot = 1;
    const pointsMid = 2;
    let pointsToAward;

    if (ballY > netDivTopY && ballY < netDivBotY) {
        pointsToAward = pointsMid;
    }
    else{
        pointsToAward = pointsTopBot;
    }

    if (player == 1){
        p1Score += pointsToAward;
        p1ScoreTxt.text = p1Score;
        lastPlayerScored = 1
    }
    else{
        p2Score += pointsToAward;
        p2ScoreTxt.text = p2Score;
        lastPlayerScored = 2
    }

    ballState = 0;
    ballSprite.visible = false;
}

//Game logic
let gameLoop = () => {
    if (gameRunning){
        checkPlayerInput();
        updateBall();
    }


}

//Keyboard Input

//Update keys down
let keysPress = (e) => {
    //P1 Shoot - X
    console.log(e.keyCode);
    if (e.keyCode = "120" && !e.repeat){
        if (ballStuck == 1){
            if (keys["81"] && !keys["65"]){
                shootPlayer(315);
            }
            else if(keys["65"]&& !keys["81"]){
                shootPlayer(45);
            }
            else{
                shootPlayer(0);
            }
        }
    }

    //P1 Super - C
    if (keys["99"]){
        
    }
    
    //P2 Shoot - /
    if (e.keyCode = "47"){
        if (ballStuck == 2){
            if (keys["38"] && !keys["40"]){
                shootPlayer(225);
            }
            else if(keys["40"]&& !keys["38"]){
                shootPlayer(135);
            }
            else{
                shootPlayer(180);
            }
        }
    }

    //P2 Super - .
    if (keys["47"]){
        
    }    
} 
 
let keysDown = (e) => {
    keys[e.keyCode] = true;
}

//Update keys up
let keysUp = (e) => {
    keys[e.keyCode] = false;
}

//Check player controls
let checkPlayerInput = () => {
    //Pause - Esc
    if (keys["27"]){
        
    }

    //P1 Up - Q
    if (keys["81"] && !keys["65"]){
        if (ballStuck != 1){
            movePlayer(1, -1);
        }
    }

    //P1 Down - A 
    if (keys["65"]&& !keys["81"]){
        if (ballStuck != 1){
            movePlayer(1, 1);
        }
    }



    //P2 Up - Up Arrow
    if (keys["38"] && !keys["40"]){
        if (ballStuck != 2){
            movePlayer(2, -1);
        }
    }

    //P2 Down - Down Arrow 
    if (keys["40"] && !keys["38"]){
        if (ballStuck != 2){
            movePlayer(2, 1);
        }
    }
}
//End Keyboard Input

//Move player logic, playerToMove 1 or 2, moveDirection -1 up / 1 down 
let movePlayer = (playerToMove, moveDirection) => {
    let myPlayerToMove;
    let myPlayerSpeed;
    let targetPosition;

    if (playerToMove == 1){
        myPlayerToMove = p1;

        if (p1Charge < fullPlayerCharge){
            myPlayerSpeed = basePlayerSpeed;
        }
        else{
            myPlayerSpeed = chargedPlayerSpeed;
        }
    }
    else{
        myPlayerToMove = p2;

        if (p2Charge < fullPlayerCharge){
            myPlayerSpeed = basePlayerSpeed;
        }
        else{
            myPlayerSpeed = chargedPlayerSpeed;
        }
    }

    targetPosition = Math.floor(myPlayerToMove.y + myPlayerSpeed * moveDirection * (app.ticker.deltaMS * 0.01));
    if (moveDirection == -1){
        if (targetPosition > playAreaOffset + paddleYGap + myPlayerToMove.height / 2 ){
            myPlayerToMove.y = targetPosition;
        }
        else{
            myPlayerToMove.y = playAreaOffset + paddleYGap + myPlayerToMove.height / 2;
        }
    }
    else{
        if (targetPosition < app.view.height - playAreaOffset - paddleYGap - myPlayerToMove.height / 2 ){
            myPlayerToMove.y = targetPosition;
        }
        else{
            myPlayerToMove.y = app.view.height - playAreaOffset - paddleYGap - myPlayerToMove.height / 2 ;
        }
    }
}

let shootPlayer = (angle) => {
    ballAngle = angle;
    ballStuck = 0;
}