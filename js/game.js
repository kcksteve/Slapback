let app;
const basePlayerSpeed = 40;
const chargedPlayerSpeed = 60;
const fullPlayerCharge = 6;
const playAreaOffset = 20;
const paddleYGap = 10;
let p1;
let p1Score;
let p1ScoreTxt;
let p1Speed;
let p1Charge;
let p2;
let p2Score;
let p2ScoreTxt;
let p2Speed;
let p2Charge;
let bgSprite;
let ballSprite;
let ballAngle;
let gameRunning;
let keys = {};

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

    
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    app.ticker.add(gameLoop);
}

//Setup player paddles and data
let setupPlayers = () => {
    const offsetFromEdge = 50;

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
    ballSprite = new PIXI.Sprite.from("images/Ball.png");
    ballSprite.anchor.set(0.5);
    ballSprite.x = app.view.width / 2;
    ballSprite.y = (app.view.height / 2 - 100) + Math.floor(Math.random() * 200);
    ballSprite.zIndex = 20;
    app.stage.addChild(ballSprite);
}

//Start a round
let startRound = () => {
    createBall();
    gameRunning = true;
}

//Game logic
let gameLoop = () => {
    if (gameRunning){
        checkPlayerInput();
    }


}

//Keyboard Input

//Update keys down
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
    if (keys["81"]){
        movePlayer(1, -1);
    }

    //P1 Down - A 
    if (keys["65"]){
        movePlayer(1, 1);
    }

    //P1 Shoot - Space
    if (keys["32"]){
        
    }

    //P1 Super - Alt
    if (keys["18"]){
        
    }

    //P2 Up - Up Arrow
    if (keys["38"]){
        movePlayer(2, -1);
    }

    //P2 Down - Down Arrow 
    if (keys["40"]){
        movePlayer(2, 1);
    }

    //P2 Shoot - Shift
    if (keys["32"]){
        
    }

    //P2 Super - Ctrl
    if (keys["17"]){
        
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