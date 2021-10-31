//const { Howl } = require("js/howler");

let app;

const basePlayerSpeed = 50;
const chargedPlayerSpeed = 70;
const fullPlayerCharge = 6;
const playAreaOffset = 20;
const paddleYGap = 10;
const netDivTopY = 200;
const netDivBotY = 400;
const netXoffset = 30;

//Global vars and constants
let p1;
let p1MoveUp = false;
let p1MoveDown = false;
let p1Score;
let p1ScoreTxt;
let p1Speed;
let p1Charge;
let p1TopNet;
let p1MidNet;
let p1BotNet;

let p2;
let p2MoveUp = false;
let p2MoveDown = false;
let p2Score;
let p2ScoreTxt;
let p2Speed;
let p2Charge;
let p2TopNet;
let p2MidNet;   
let p2BotNet;

let lastPlayerScored = 0;

let bgSprite;

let ballExplode;
let ballExplodeSheet = [];
let ballHits = [];
let ballHitLast = 0;
let ballHitSheet = [];
let ballSprite;
let ballAngle;
let ballHalo;
let ballState = 0;
let ballStuck = 0;
let ballStuckTimer = 0;
let ballSpeedState;
let ballSpawnTimer = 0;
const ballSpawnTime = 1.2;
const ballSpeeds = [20, 40, 50, 80];
const ballSpeedsSfxRates = [1, 1.1, 1.2, 1.3];
const ballReleaseTime = 0.9;
const ballParryTime = 0.20;

let sfxBounce;
let sfxPoint;
let sfxSuper;
let sfxBallDestroy;

let keybListener;
let gameRunning;
let keys = {};
let keysPressed = {};

//Setup after loading
window.onload = () => {
    app = new PIXI.Application(
        {
            width: 800,
            height: 600,
            backgroundColor: 0x0D0D0D,
            roundPixels: true
        }
    );
    
    //Add pixi to body
    document.body.appendChild(app.view);

    //Load all images
    preloadAssets();

}

//Setup all game elements
let setupAll = () => {
    setupBall();
    setupControls();
    setupUI();
    setupPlayers();
    setupLevel();
    setupAudio();
    startRound();
    app.ticker.add(gameLoop);
}

//Call all setups after loading images
let preloadAssets = () => {
    app.loader.add("paddle", "images/Paddle.png")
    app.loader.add("playarea", "images/PlayArea.png")
    app.loader.add("net", "images/Net.png")
    app.loader.add("ballhalo", "images/BallHalo.png")
    app.loader.add("ball", "images/Ball.png")
    app.loader.add("ballhit", "images/BallHit.png")
    app.loader.add("ballexplode", "images/BallExplode.png")
    app.loader.add("sfxBounce", "audio/bounce.mp3")
    app.loader.add("sfxPoint", "audio/point.mp3")
    app.loader.add("sfxBallDestroy", "audio/balldestroy.mp3")
    app.loader.add("sfxSuper", "audio/super.mp3")


    app.loader.load(setupAll);
}

let setupAudio = () => {
    sfxBounce = new Howl({
        src: [app.loader.resources["sfxBounce"].url]
    })

    sfxPoint = new Howl({
        src: [app.loader.resources["sfxPoint"].url]
    })

    sfxBallDestroy = new Howl({
        src: [app.loader.resources["sfxBallDestroy"].url]
    })

    sfxSuper = new Howl({
        src: [app.loader.resources["sfxSuper"].url]
    })
}

//Setup player paddles and data
let setupPlayers = () => {
    const offsetFromEdge = 56;

    //Setup player 1
    p1 = new PIXI.Sprite.from(app.loader.resources["paddle"].url);
    p1.anchor.set(0.5);
    p1.x = p1.width / 2 + offsetFromEdge;
    p1.y = app.view.height / 2;
    p1.zIndex = 11;
    app.stage.addChild(p1);
    p1Score = 0;
    p1Charge = 0;

    //Setup player 2
    p2 = new PIXI.Sprite.from(app.loader.resources["paddle"].url);
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
    bgSprite = new PIXI.Sprite.from(app.loader.resources["playarea"].url);
    bgSprite.anchor.set(0.5);
    bgSprite.x = app.view.width / 2;
    bgSprite.y = app.view.height / 2;
    bgSprite.zIndex = 0;
    app.stage.addChild(bgSprite);

    const netTopY = 114;
    const netBotY = 486;

    p1TopNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p1TopNet.anchor.set(0.5);
    p1TopNet.x = netXoffset;
    p1TopNet.y = netTopY;
    p1TopNet.zIndex = 0;
    app.stage.addChild(p1TopNet);

    p1MidNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p1MidNet.anchor.set(0.5);
    p1MidNet.x = netXoffset;
    p1MidNet.y = app.view.height / 2;
    p1MidNet.zIndex = 0;
    app.stage.addChild(p1MidNet);

    p1BotNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p1BotNet.anchor.set(0.5);
    p1BotNet.x = netXoffset;
    p1BotNet.y = netBotY;
    p1BotNet.zIndex = 0;
    app.stage.addChild(p1BotNet);

    p2TopNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p2TopNet.anchor.set(0.5);
    p2TopNet.x = app.view.width - netXoffset;
    p2TopNet.y = netTopY;
    p2TopNet.zIndex = 0;
    app.stage.addChild(p2TopNet);

    p2MidNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p2MidNet.anchor.set(0.5);
    p2MidNet.x = app.view.width - netXoffset;
    p2MidNet.y = app.view.height / 2;
    p2MidNet.zIndex = 0;
    app.stage.addChild(p2MidNet);

    p2BotNet = new PIXI.Sprite.from(app.loader.resources["net"].url);
    p2BotNet.anchor.set(0.5);
    p2BotNet.x = app.view.width - netXoffset;
    p2BotNet.y = netBotY;
    p2BotNet.zIndex = 0;
    app.stage.addChild(p2BotNet);
}

//Setup game player ui
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

//Setup ball
let setupBall = () => {
    //Setup ball halo sprite
    ballHalo = new PIXI.Sprite.from(app.loader.resources["ballhalo"].url);
    ballHalo.x = -100
    ballHalo.y = -100;
    ballHalo.anchor.set(0.5);
    app.stage.addChild(ballHalo);

    //Setup impact sprite
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["ballhit"].url);
    let sheetSize = ssheet.height;
    let frames = ssheet.width / ssheet.height
    for (i = 0; i < frames; i++){
        ballHitSheet.push(new PIXI.Texture(ssheet, new PIXI.Rectangle(i * sheetSize, 0, sheetSize, sheetSize)));
    }

    for (i = 0; i < 4; i++){
        ballHits.push(new PIXI.AnimatedSprite(ballHitSheet));
        ballHits[i].anchor.set(0.5);
        ballHits[i].x = -100;
        ballHits[i].y = -100;
        ballHits[i].animationSpeed = 0.25;
        ballHits[i].loop = false;
        app.stage.addChild(ballHits[i]);
    }

    //Setup explode sprite
    let ssheet2 = new PIXI.BaseTexture.from(app.loader.resources["ballexplode"].url);
    let sheet2Size = ssheet2.height;
    let frames2 = ssheet2.width / ssheet2.height
    for (i = 0; i < frames2; i++){
        ballExplodeSheet.push(new PIXI.Texture(ssheet2, new PIXI.Rectangle(i * sheet2Size, 0, sheet2Size, sheet2Size)));
    }

    ballExplode = new PIXI.AnimatedSprite(ballExplodeSheet);
    ballExplode.anchor.set(0.5);
    ballExplode.x = -100;
    ballExplode.y = -100;
    ballExplode.animationSpeed = 0.25;
    ballExplode.loop = false;
    app.stage.addChild(ballExplode);
}

//Create a ball
let createBall = () => {
    if (ballSprite != null){
        ballSprite.destroy();
    }

    ballSprite = new PIXI.Sprite.from(app.loader.resources["ball"].url);
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
        const straightMulti = 1.4142;

        switch (ballAngle) {
            case 0:
                ballOffsetX = ballSpeeds[ballSpeedState] * straightMulti;
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
                ballOffsetX = ballSpeeds[ballSpeedState] * -1 * straightMulti;
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
        setBallHit();
        playSfxBounce();
        return playAreaOffset + 4 + ballSprite.height / 2;
    } 
    else if (ballSprite.y + ballSprite.height / 2 >= app.view.height - playAreaOffset - 3){
        if (ballAngle == 135){
            ballAngle = 225;
        }
        else {
            ballAngle = 315;
        }
        setBallHit();
        playSfxBounce();
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
                playerScore(2, ballSprite.x, ballSprite.y);
                return x;
            }
            else if(paddleIsPlayer == 2 && x >= app.view.width - netXoffset){
                playerScore(1, ballSprite.x, ballSprite.y);
                return x;
            }
            else{
                return x;
            }
        }




}

//Update ball based on it's state 0=NoneInPlay, 1=InPlay, 2=Scored
let updateBall = () => {
    updateStuckTimer();
    updateBallHalo();

    switch (ballState) {
        case 0:
                if (ballSpawnTimer <= ballSpawnTime){
                    ballSpawnTimer += app.ticker.deltaMS * 0.001;
                }
                else{
                    ballSpawnTimer = 0;
                    createBall();
                }
            break;
        case 1:
            moveBall();
            break;
        case 2:
            moveBall();
            break;
    }
}

let updateBallHalo = () => {
    if (ballStuck == 0){
        ballHalo.visible = false;
    }
    else{
        ballHalo.x = ballSprite.x;
        ballHalo.y = ballSprite.y;
        ballHalo.visible = true;
    }
}

let setBallHit = () => {
    if (ballHitLast + 1 < ballHits.length){
        ballHitLast += 1;
    }
    else{
        ballHitLast = 1;
    }
    ballHits[ballHitLast].x = ballSprite.x;
    ballHits[ballHitLast].y = ballSprite.y;
    ballHits[ballHitLast].gotoAndPlay(0);
}

let updateStuckTimer = () => {
    if (ballStuck == 0){
        ballStuckTimer = 0;
    }
    else{
        ballStuckTimer += app.ticker.deltaMS * 0.001;
    }

    if (ballStuckTimer >= ballReleaseTime){
        if (ballStuck == 1){
            shootPlayer(0);
        }
        else if (ballStuck == 2){
            shootPlayer(180);
        }
    }
}

//Start a round
let startRound = () => {
    gameRunning = true;
}

let playerScore = (player, ballX, ballY) => {
    const pointsTopBot = 1;
    const pointsMid = 2;
    let pointsToAward;

    ballExplode.x = ballX;
    ballExplode.y = ballY;
    ballExplode.gotoAndPlay(0);

    sfxBallDestroy.play();

    if (ballY > netDivTopY && ballY < netDivBotY) {
        pointsToAward = pointsMid;
    }
    else{
        pointsToAward = pointsTopBot;
    }

    applyScore = () =>{
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
        sfxPoint.play();
    }

    setTimeout(applyScore, 300)

    ballState = 0;
    ballSprite.visible = false;
}

//Game logic
let gameLoop = () => {
    if (gameRunning){
        checkPlayerMovement();
        updateBall();
    }
}

//Keyboard Input

let setupControls = () =>{
    keybListener = new window.keypress.Listener();
    keybListener.register_many([
        {
            //P1 Up
            "keys" : "w",
            "on_keydown" : () => p1MoveUp = true,
            "on_keyup" : () => p1MoveUp = false,
            "prevent_repeat" : true
        },
        {
            //P1 Down
            "keys" : "s",
            "on_keydown" : () => p1MoveDown = true,
            "on_keyup" : () => p1MoveDown = false,
            "prevent_repeat" : true
        },
        {
            //P1 Shoot
            "keys" : "d",
            "on_keydown" : () => p1Shoot(),
            "prevent_repeat" : true
        },
        {
            //P1 Super
            "keys" : "a",
            "on_keydown" : () => p1Super(),
            "prevent_repeat" : true
        },
        {
            //P2 Up
            "keys" : "up",
            "on_keydown" : () => p2MoveUp = true,
            "on_keyup" : () => p2MoveUp = false,
            "prevent_repeat" : true
        },
        {
            //P2 Down
            "keys" : "down",
            "on_keydown" : () => p2MoveDown = true,
            "on_keyup" : () => p2MoveDown = false,
            "prevent_repeat" : true
        },
        {
            //P2 Shoot
            "keys" : "left",
            "on_keydown" : () => p2Shoot(),
            "prevent_repeat" : true
        },
        {
            //P2 Super
            "keys" : "right",
            "on_keydown" : () => p2Super(),
            "prevent_repeat" : true
        },
        {
            //Pause
            "keys" : "escape",
            "on_keydown" : () => pause(),
            "prevent_repeat" : true
        }
    ]);
}

//Player action functions

let p1Shoot = () => {
    if (ballStuck == 1){
        if (p1MoveUp && !p1MoveDown){
            shootPlayer(315, 1);
        }
        else if(!p1MoveUp && p1MoveDown){
            shootPlayer(45, 1);
        }
        else{
            shootPlayer(0, 1);
        }
    }
} 

let p1Super = () => {
    if (ballStuck == 1 && p1Charge >= fullPlayerCharge){
        if (p1MoveUp && !p1MoveDown){
            superShootPlayer(315, 1);
        }
        else if(!p1MoveUp && p1MoveDown){
            superShootPlayer(45, 1);
        }
        else{
            superShootPlayer(0, 1);
        }
    }
} 

let p2Shoot = () => {
    if (ballStuck == 2){
        if (p2MoveUp && !p2MoveDown){
            shootPlayer(225, 2);
        }
        else if(!p2MoveUp && p2MoveDown){
            shootPlayer(135, 2);
        }
        else{
            shootPlayer(180, 2);
        }
    }
} 

let p2Super = () => {
    if (ballStuck == 2 && p2Charge >= fullPlayerCharge){
        if (p2MoveUp && !p2MoveDown){
            superShootPlayer(225, 2);
        }
        else if(!p2MoveUp && p2MoveDown){
            superShootPlayer(135, 2);
        }
        else{
            superShootPlayer(180, 2);
        }
    }
} 

let pause = () => {
    console.log("pause");
}

//Check player movement variables
let checkPlayerMovement = () => {
    //P1 Up
    if (p1MoveUp && !p1MoveDown && ballStuck != 1){
        movePlayer(1, -1);
    }

    //P1 Down
    if (!p1MoveUp && p1MoveDown && ballStuck != 1){
        movePlayer(1, 1);
    }

    //P2 Up
    if (p2MoveUp && !p2MoveDown && ballStuck != 2){
        movePlayer(2, -1);
    }

    //P2 Down
    if (!p2MoveUp && p2MoveDown && ballStuck != 2){
        movePlayer(2, 1);
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


let shootPlayer = (angle, player) => {
    ballAngle = angle;
    ballStuck = 0;

    if (ballStuckTimer <= ballParryTime){
        if (ballSpeedState <= 1){
            ballSpeedState += 1;
        }
        else {
            ballSpeedState = 2
        }

        if (player == 1){
            p1Charge += 1;
        }
        else{
            p2Charge += 1;
        }
    }
    else{
        ballSpeedState = 0;
    }

    setBallHit();
    playSfxBounce();
}

let superShootPlayer = (angle, player) => {
    if (player == 1){
        p1Charge = 0;
    }
    else{
        p2Charge = 0;
    }

    ballAngle = angle;
    ballStuck = 0;
    ballSpeedState = ballSpeeds.length - 1;
    sfxSuper.play();
}

let playSfxBounce = () => {
    sfxBounce.rate(ballSpeedsSfxRates[ballSpeedState]);
    sfxBounce.play();
}