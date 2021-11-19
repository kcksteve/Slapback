//Global vars and constants
let app;

const basePlayerSpeed = 48;
const chargedPlayerSpeed = 65;
const fullPlayerCharge = 6;
const playAreaOffset = 20;
const roundTimeLimit = 5;
const paddleYGap = 10;
const netDivTopY = 200;
const netDivBotY = 400;
const netXoffset = 30;
const paddleHeight = 70;

let p1;
let p1Indicator;
let p1MoveUp = false;
let p1MoveDown = false;
let p1PadIndex = 0;
let p1Score;
let p1ScoreTxt;
let p1Speed;
let p1Charge;
let p1TopNet;
let p1MidNet;
let p1BotNet;

let p2;
let p2Indicator;
let p2MoveUp = false;
let p2MoveDown = false;
let p2PadIndex = 1;
let p2Score;
let p2ScoreTxt;
let p2Speed;
let p2Charge;
let p2TopNet;
let p2MidNet;   
let p2BotNet;

let gameState;
let isPaused = false;
let isOvertime = false;
let isMidRound = false;
let scoreToWin = 7;
let lastPlayerScored = 0;
let roundTimeElapsed = 0;
let roundCountDownTicks = 0;
let round = 0;
let roundWinners = [];
let roverLabels = [];
let roverBox = [];
let timerBarFlashTimer = 0;
let bgSprite;
let timerBars = [];
let blinder;
let pauseTxt;
let pauseTxt2;
let titleSprite;
let menuTxt;
let menuTxt2;
let menuTxt3;
let menuPointers = [];
let menuPointerState = 0;
let menuCanPointerChange = false;
const menuPointerOffset = 20;

let ballExplode;
let ballExplodeSheet = [];
let ballHits = [];
let ballHitLast = 0;
let ballHitSheet = [];
let ballTrail = [];
let ballTrailLagCount = 0;
let ballLastPositions = [];
let ballSprite;
let ballAngle;
let ballNextAngle;
let ballStartMovementY;
let ballHalo;
let ballState = 0;
let ballStuck = 0;
let ballStuckTimer = 0;
let ballSpeedState;
let ballSpawnTimer = 0;
const ballTrailLag = 6;
const ballSpawnTime = 1.2;
const ballSpeeds = [35, 50, 65, 90];
const ballSpeedsSfxRates = [1, 1.1, 1.2, 1.3];
const ballReleaseTime = 0.9;
const ballParryTime = 0.20;

let sfxBounce;
let sfxPoint;
let sfxSuper;
let sfxBallDestroy;
let sfxRoundPoint;
let sfxCountDown;
let sfxTitle;
let sfxStart;

let isGameOver;
let keybListener;
let gamepadListener;
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
            roundPixels: true,
        }
    );
    
    //Add pixi to body
    document.body.appendChild(app.view);
    
    //Enable z sorting
    app.stage.sortableChildren = true;

    //Match background to canvas
    document.body.style.backgroundColor = "#0D0D0D";

    //Scale canvas to window
    scaleMe(app);
    window.addEventListener("resize", () => {scaleMe(app)});

    //Load all images and audio
    preloadAssets();
}

//Setup all game elements
let setupAll = () => {
    setupBall();
    setupControls();
    setupPlayers();
    setupLevel();
    setupUI();
    setupAudio();
    menuStart();
    app.ticker.add(gameLoop);
}

//Call all setups after loading images
let preloadAssets = () => {
    app.loader.add("paddle", "images/Paddle.png")
    app.loader.add("paddleIndicator", "images/PaddleIndicator.png")
    app.loader.add("playarea", "images/PlayArea.png")
    app.loader.add("net", "images/Net.png")
    app.loader.add("ballhalo", "images/BallHalo.png")
    app.loader.add("ball", "images/Ball.png")
    app.loader.add("ballhit", "images/BallHit.png")
    app.loader.add("ballexplode", "images/BallExplode.png")
    app.loader.add("timerbar", "images/TimerBar.png")
    app.loader.add("winnerbox", "images/WinnerBox.png")
    app.loader.add("blinder", "images/Blinder.png")
    app.loader.add("title", "images/Title.png")
    app.loader.add("sfxBounce", "audio/bounce.mp3")
    app.loader.add("sfxPoint", "audio/point.mp3")
    app.loader.add("sfxBallDestroy", "audio/balldestroy.mp3")
    app.loader.add("sfxSuper", "audio/super.mp3")
    app.loader.add("sfxPlayerMiss", "audio/playermiss.mp3")
    app.loader.add("sfxBallHitNet", "audio/ballhitnet.mp3")
    app.loader.add("sfxRoundPoint", "audio/roundpoint.mp3")
    app.loader.add("sfxCountDown", "audio/countdowntick.mp3")
    app.loader.add("sfxStart", "audio/startgame.mp3")
    app.loader.add("sfxTitle", "audio/titleshow.mp3")

    app.loader.load(setupAll);
}

let setupAudio = () => {
    volumeAll = 0.15;

    sfxBounce = new Howl({
        src: [app.loader.resources["sfxBounce"].url],
        volume: volumeAll
    })

    sfxPoint = new Howl({
        src: [app.loader.resources["sfxPoint"].url],
        volume: volumeAll
    })

    sfxBallDestroy = new Howl({
        src: [app.loader.resources["sfxBallDestroy"].url],
        volume: volumeAll
    })

    sfxSuper = new Howl({
        src: [app.loader.resources["sfxSuper"].url],
        volume: volumeAll
    })

    sfxPlayerMiss = new Howl({
        src: [app.loader.resources["sfxPlayerMiss"].url],
        volume: volumeAll
    })

    sfxBallHitNet = new Howl({
        src: [app.loader.resources["sfxBallHitNet"].url],
        volume: volumeAll
    })

    sfxRoundPoint = new Howl({
        src: [app.loader.resources["sfxRoundPoint"].url],
        volume: volumeAll
    })

    sfxCountDown = new Howl({
        src: [app.loader.resources["sfxCountDown"].url],
        volume: volumeAll
    })

    sfxTitle = new Howl({
        src: [app.loader.resources["sfxTitle"].url],
        volume: volumeAll
    })

    sfxStart = new Howl({
        src: [app.loader.resources["sfxStart"].url],
        volume: volumeAll
    })
}

//Setup player paddles and data
let setupPlayers = () => {
    const offsetFromEdge = 64;
    const indicatorOffset = 10;

    //Setup player 1
    //p1 paddle
    p1 = new PIXI.Sprite.from(app.loader.resources["paddle"].url);
    p1.anchor.set(0.5);
    p1.x = p1.width / 2 + offsetFromEdge;
    p1.y = app.view.height / 2;
    p1.height = paddleHeight;
    p1.zIndex = 11;
    app.stage.addChild(p1);
    //p1 paddle indicator
    p1Indicator = new PIXI.Sprite.from(app.loader.resources["paddleIndicator"].url);
    p1Indicator.anchor.set(0.5);
    p1Indicator.x = indicatorOffset * -1;
    p1Indicator.height = 0;
    p1.addChild(p1Indicator);
    //Set var defaults
    p1Score = 0;
    p1Charge = 0;

    //Setup player 2
    //p2 paddle
    p2 = new PIXI.Sprite.from(app.loader.resources["paddle"].url);
    p2.anchor.set(0.5);
    p2.x = app.view.width - offsetFromEdge + p2.width / 2;
    p2.y = app.view.height / 2;
    p2.height = paddleHeight;
    p2.zIndex = 10;
    app.stage.addChild(p2);
    //p2 paddle indicator
    p2Indicator = new PIXI.Sprite.from(app.loader.resources["paddleIndicator"].url);
    p2Indicator.anchor.set(0.5);
    p2Indicator.x = indicatorOffset;
    p2Indicator.height = 0;
    p2.addChild(p2Indicator);
    //Set var defaults
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
    const roverLabelStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 36,
        fontFamily: "thirteenPixels"
    })

    const menuTxtStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "thirteenPixels"
    })

    const pauseSubTxtStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 16,
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

    //Setup timer bars
    const timerBarGap = 4;
    //Top timer bar
    timerBars[0] = new PIXI.Sprite.from(app.loader.resources["timerbar"].url);
    timerBars[0].anchor.set(0.5);
    timerBars[0].x = app.view.width / 2;
    timerBars[0].y = app.view.height / 2 - bgSprite.height / 2 - timerBarGap; 
    app.stage.addChild(timerBars[0]);
    //Bottom timer bar
    timerBars[1] = new PIXI.Sprite.from(app.loader.resources["timerbar"].url);
    timerBars[1].anchor.set(0.5);
    timerBars[1].x = app.view.width / 2;
    timerBars[1].y = app.view.height / 2 + bgSprite.height / 2 + timerBarGap; 
    app.stage.addChild(timerBars[1]);


    //Setup round over screen
    const roverBoxSpacing = 64;
    const roverLabelOffset = roverBoxSpacing * 2;
    //Round over text
    for (i = 0; i < 5; i++){
        roverLabels[i] = new PIXI.Text("");

        switch(i){
            case 0:
                roverLabels[i].style = scoreTxtStyle;
                roverLabels[i].x = app.view.width / 2;
                roverLabels[i].y = app.view.height / 2 - roverLabelOffset;
                roverLabels[i].anchor.set(0.5);
                roverLabels[i].text = "";
                roverLabels[i].visible = false;

                break;
            case 1:
                roverLabels[i].style = roverLabelStyle;
                roverLabels[i].x = roverBoxSpacing * -1.6;
                roverLabels[i].y = roverLabelOffset - roverBoxSpacing / 2;
                roverLabels[i].anchor.set(0.5);
                roverLabels[i].text = "P1";
                break;
            case 2:
                roverLabels[i].style = roverLabelStyle;
                roverLabels[i].x = roverBoxSpacing * -1.6;
                roverLabels[i].y = roverLabelOffset + roverBoxSpacing / 2;
                roverLabels[i].anchor.set(0.5);
                roverLabels[i].text = "P2";
                break;
            case 3:
                roverLabels[i].style = pauseSubTxtStyle;
                roverLabels[i].x = 0;
                roverLabels[i].y = roverLabelOffset + roverBoxSpacing * 2;
                roverLabels[i].anchor.set(0.5);
                roverLabels[i].text = "ENTER/START TO PLAY AGAIN";
                break;
            case 4:
                roverLabels[i].style = pauseSubTxtStyle;
                roverLabels[i].x = 0;
                roverLabels[i].y = roverLabelOffset + roverBoxSpacing * 1.5;
                roverLabels[i].anchor.set(0.5);
                roverLabels[i].text = "BACKSPACE/BACK FOR MENU";
                break;
        }



        if (i == 0){
            app.stage.addChild(roverLabels[i]);
        }
        else {
            roverLabels[0].addChild(roverLabels[i]);
        }
    }

    //Round over boxes
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["winnerbox"].url);
    let roverBoxSheet = [];
    let sheetSize = ssheet.height;
    let frames = ssheet.width / ssheet.height
    for (i = 0; i < frames; i++){
        roverBoxSheet.push(new PIXI.Texture(ssheet, new PIXI.Rectangle(i * sheetSize, 0, sheetSize, sheetSize)));
    }

    for (i = 0; i < 6; i++){
        roverBox[i] = new PIXI.AnimatedSprite(roverBoxSheet);
        roverBox[i].anchor.set(0.5);

        if (i == 0 || i == 3){
            roverBox[i].x = roverBoxSpacing / 2 * -1;
        }
        else if (i == 1 || i == 4){
            roverBox[i].x = roverBoxSpacing / 2;
        }
        else {
            roverBox[i].x = roverBoxSpacing * 1.5;
        }

        if (i < 3){
            roverBox[i].y = roverLabelOffset - roverBoxSpacing / 2;
        }
        else{
            roverBox[i].y = roverLabelOffset + roverBoxSpacing / 2;
        }
        
        roverBox[i].animationSpeed = 0;
        roverBox[i].loop = false;
        roverLabels[0].addChild(roverBox[i]);
    }

    //Setup Blinder
    blinder = new PIXI.Sprite.from(app.loader.resources["blinder"].url);
    blinder.anchor.set(0.5);
    blinder.x = app.view.width / 2;
    blinder.y = app.view.height / 2;
    blinder.zIndex = 100;
    blinder.alpha = 0;
    app.stage.addChild(blinder);

    //Setup pause text
    pauseTxt = new PIXI.Text("PAUSE");
    pauseTxt.x = app.view.width / 2;
    pauseTxt.y = app.view.height / 2;
    pauseTxt.anchor.set(0.5);
    pauseTxt.zIndex = 101;
    pauseTxt.alpha = 0;
    pauseTxt.style = scoreTxtStyle;
    app.stage.addChild(pauseTxt);

    pauseTxt2 = new PIXI.Text("BACKSPACE/BACK FOR MENU");
    pauseTxt2.x = app.view.width / 2;
    pauseTxt2.y = app.view.height / 2 + 50;
    pauseTxt2.anchor.set(0.5);
    pauseTxt2.zIndex = 101;
    pauseTxt2.alpha = 0;
    pauseTxt2.style = pauseSubTxtStyle;
    app.stage.addChild(pauseTxt2);

    //Setup main menu
    titleSprite = new PIXI.Sprite.from(app.loader.resources["title"].url);
    titleSprite.anchor.set(0.5);
    titleSprite.x = app.view.width / 2;
    titleSprite.y = 200;
    titleSprite.zIndex = 102;
    app.stage.addChild(titleSprite);

    menuTxt = new PIXI.Text("PLAY PVP");
    menuTxt.y = 140;
    menuTxt.anchor.set(0.5);
    menuTxt.zIndex = 102;
    menuTxt.style = menuTxtStyle;
    titleSprite.addChild(menuTxt);

    menuTxt2 = new PIXI.Text("HOW TO PLAY");
    menuTxt2.y = 170;
    menuTxt2.anchor.set(0.5);
    menuTxt2.zIndex = 102;
    menuTxt2.style = menuTxtStyle;
    titleSprite.addChild(menuTxt2);

    menuTxt3 = new PIXI.Text("QUIT");
    menuTxt3.y = 200;
    menuTxt3.anchor.set(0.5);
    menuTxt3.zIndex = 102;
    menuTxt3.style = menuTxtStyle;
    titleSprite.addChild(menuTxt3);

    menuPointers[0] = new PIXI.Sprite.from(app.loader.resources["ball"].url);
    menuPointers[0].anchor.set(0.5);
    menuPointers[0].x = menuTxt.width / 2 + menuPointerOffset;
    menuPointers[0].y = menuTxt.y;
    menuPointers[0].zIndex = 102;
    titleSprite.addChild(menuPointers[0]);

    menuPointers[1] = new PIXI.Sprite.from(app.loader.resources["ball"].url);
    menuPointers[1].anchor.set(0.5);
    menuPointers[1].x = (menuTxt.width / 2 + menuPointerOffset) * -1;
    menuPointers[1].y = menuTxt.y;
    menuPointers[1].zIndex = 102;
    titleSprite.addChild(menuPointers[1]);
    
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

    //Setup ball trail
    let ballTrailShrink = 4; 
    for (i = 0; i < 3; i++){
        ballTrail[i] = new PIXI.Sprite.from(app.loader.resources["ball"].url);
        ballTrail[i].x = -100;
        ballTrail[i].y = -100;
        ballTrail[i].width -= ballTrailShrink * i;
        ballTrail[i].height -= ballTrailShrink * i;
        ballTrail[i].anchor.set(0.5);
        ballTrail[i].alpha = 0.15;
        app.stage.addChild(ballTrail[i]);

        ballLastPositions.push({"x": 0, "y": 0})
    }
    ballLastPositions.push({"x": 0, "y": 0})
}

//Create a ball
let createBall = () => {
    if (ballSprite != null){
        ballSprite.destroy();
    }

    resetBallTrail();
    ballSprite = new PIXI.Sprite.from(app.loader.resources["ball"].url);
    ballSprite.anchor.set(0.5);
    ballSprite.x = app.view.width / 2;
    ballSprite.y = 120;
    ballStartMovementY = (app.view.height / 2 - 100) + Math.floor(Math.random() * 200);
    ballSprite.zIndex = 0;
    app.stage.addChild(ballSprite);
    ballState = 1;
    ballSpeedState = 0;
    ballAngle = 90;

    if (lastPlayerScored == 0){
        randAngle = Math.floor(Math.random() * 4)

        switch (randAngle) {
            case 0:
                ballNextAngle = 45;
                break;
            case 1:
                ballNextAngle = 135;
                break;
            case 2:
                ballNextAngle = 225;
                break;
            case 3:
                ballNextAngle = 315;
                break;
        }
    }
    else if (lastPlayerScored == 1){
        randAngle = Math.floor(Math.random() * 2)

        switch (randAngle) {
            case 0:
                ballNextAngle = 135;
                break;
            case 1:
                ballNextAngle = 225;
                break;
        }
    }
    else {
        randAngle = Math.floor(Math.random() * 2)

        switch (randAngle) {
            case 0:
                ballNextAngle = 45;
                break;
            case 1:
                ballNextAngle = 315;
                break;
        }
    }
}

let moveBall = () => {
    if (ballStuck == 0){
        let ballOffsetX;
        let ballOffsetY;
        let steppedLoc = {};
        const straightMulti = 1.4142;

        if (ballAngle == 90 && ballSprite.y >= ballStartMovementY) {
            ballAngle = ballNextAngle;
        }

        switch (ballAngle) {
            case 0:
                ballOffsetX = ballSpeeds[ballSpeedState] * straightMulti;
                ballOffsetY = 0;
                break;
            case 45:
                ballOffsetX = ballSpeeds[ballSpeedState];
                ballOffsetY = ballSpeeds[ballSpeedState];
                break;
            case 90:
                ballOffsetX = 0;
                ballOffsetY = 15;
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
        steppedLoc = checkBallStep(targetX, targetY);
        ballSprite.x = steppedLoc.x;
        ballSprite.y = steppedLoc.y;
    }
    
}

let checkBallStep = (stepX, stepY) => {
    //Setup
    let ballTop;
    let ballBot;
    let paddleToCheck; 
    let paddleIsPlayer;
    let paddleFaceX;
    let ballLocToStick;
    let paddleTop;
    let paddleBot;
    let returnY;
    let returnX;

    if (ballAngle == 135 || ballAngle == 180 || ballAngle == 225){
        paddleToCheck = p1;
        paddleIsPlayer = 1;
        paddleFaceX = p1.x + p1.width / 2;
        ballLocToStick = paddleFaceX + (ballSprite.width / 2);
    }
    else{
        paddleToCheck = p2;
        paddleIsPlayer = 2;
        paddleFaceX = p2.x - p2.width / 2;
        ballLocToStick = paddleFaceX - (ballSprite.width / 2);
    }

    paddleTop = paddleToCheck.y - paddleToCheck.height / 2;
    paddleBot = paddleToCheck.y + paddleToCheck.height / 2;

    //Check Y
    if (stepY - ballSprite.height / 2 <= playAreaOffset + 3){
        if (ballAngle == 225){
            ballAngle = 135;
        }
        else {
            ballAngle = 45;
        }
        setBallHit();
        playSfxBounce();
        returnY = playAreaOffset + 4 + ballSprite.height / 2;
    } 
    else if (stepY + ballSprite.height / 2 >= app.view.height - playAreaOffset - 3){
        if (ballAngle == 135){
            ballAngle = 225;
        }
        else {
            ballAngle = 315;
        }
        setBallHit();
        playSfxBounce();
        returnY = app.view.height - playAreaOffset - 14 - ballSprite.height / 2;
    }
    else{
        returnY = stepY;
    }

    ballTop = returnY - ballSprite.height / 2;
    ballBot = returnY + ballSprite.height / 2;

    //Check X
    if ((ballBot > paddleTop && ballBot < paddleBot) || (ballTop < paddleTop && ballTop > paddleBot)){
        if (ballState == 1){
            if (paddleIsPlayer == 1 && stepX - ballSprite.width / 2 <= paddleFaceX){
                ballStuck = paddleIsPlayer;
                returnX = ballLocToStick;
            }
            else if(paddleIsPlayer == 2 && stepX + ballSprite.width / 2 >= paddleFaceX){
                ballStuck = paddleIsPlayer;
                returnX = ballLocToStick;
            }
            else{
                returnX = stepX;
            }
        }
    }
    else {
        //Return true if should bounce
        let netCheck= (playerToCheck) => {
            let nets = [];
            if (playerToCheck == 1) {
                nets[0] = p1TopNet;
                nets[1] = p1MidNet;
                nets[2] = p1BotNet;
            }
            else{
                nets[0] = p2TopNet;
                nets[1] = p2MidNet;
                nets[2] = p2BotNet;
            }

            if (returnY <= netDivTopY){
                if (nets[0].visible){
                    nets[0].visible = false;
                    return true;
                }
                else{
                    return false;
                }
            }
            else if (returnY >= netDivBotY){
                if (nets[2].visible){
                    nets[2].visible = false;
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
                if (nets[1].visible){
                    nets[1].visible = false;
                    return true;
                }
                else{
                    return false;
                }
            }
        }

        if (paddleIsPlayer == 1 && stepX - ballSprite.width / 2 <= netXoffset){
            if (netCheck(1)){
                ballAngle = reflectBallAngle(ballAngle, "x");
                setBallHit();
                sfxBallHitNet.play();
            }
            else{
                ballState = 2;
                playerScore(2, stepX, returnY);
            }
        }
        else if(paddleIsPlayer == 2 && stepX + ballSprite.width / 2 >= app.view.width - netXoffset){
            if (netCheck(2)){
                ballAngle = reflectBallAngle(ballAngle, "x");
                setBallHit();
                sfxBallHitNet.play();
            }
            else{
                ballState = 2;
                playerScore(1, stepX, returnY);
            }
        }

        returnX = stepX;
    }

    return {"x": returnX, "y": returnY};
}

let reflectBallAngle = (angleToReflect, plane) => {    
    if (plane == "x"){
        if (angleToReflect == 135) {
            return 45;
        }
        else if (angleToReflect == 225) {
            return 315;
        }
        else if (angleToReflect == 45) {
            return 135;
        }
        else if (angleToReflect == 315) {
            return 225;
        }
        else if (angleToReflect == 0) {
            return 180;
        }
        else if (angleToReflect == 180) {
            return 0;
        }
    }
    else if (plane == "y"){
        if (angleToReflect == 225) {
            return 135;
        }
        else if (angleToReflect == 315) {
            return 45;
        }
        else if (angleToReflect == 135) {
            return 225;
        }
        else if (angleToReflect == 45) {
            return 315;
        }
    }
}

let updateBallTrail = () => {
    if (ballSprite != null){
        ballTrailLagCount += 1

        if (ballTrailLagCount >= ballTrailLag){
            ballTrailLagCount = 0;
            ballLastPositions[3].x = ballLastPositions[2].x
            ballLastPositions[3].y = ballLastPositions[2].y
            ballLastPositions[2].x = ballLastPositions[1].x
            ballLastPositions[2].y = ballLastPositions[1].y
            ballLastPositions[1].x = ballLastPositions[0].x
            ballLastPositions[1].y = ballLastPositions[0].y
            ballLastPositions[0].x = ballSprite.x
            ballLastPositions[0].y = ballSprite.y
        
            for (i = 0; i < 3; i++){
                ballTrail[i].x = ballLastPositions[i + 1].x;
                ballTrail[i].y = ballLastPositions[i + 1].y;
            }

            for (i = 0; i < 3; i++){
                if (ballTrail[i].x == ballLastPositions[0].x && ballTrail[i].y == ballLastPositions[0].y){
                    ballTrail[i].x = -100;
                    ballTrail[i].y = -100;
                }
            }
        }
    }
}

let resetBallTrail = () => {
    for (i = 0; i < 4; i++){
        ballLastPositions[i].x = -100
        ballLastPositions[i].y = -100
    }
}

//Update ball based on it's state 0=NoneInPlay, 1=InPlay, 2=Scored
let updateBall = () => {
    updateStuckTimer();
    updateBallHalo();
    updateBallTrail();

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

//Timer control
let updateGameTimer = () => {
    const timerBarFlashTime = 0.5;
    roundTimeElapsed += app.ticker.deltaMS * 0.001

    if (roundTimeElapsed <= roundTimeLimit){
        timerBars.forEach(bar => {
            bar.width = bgSprite.width * (1 - roundTimeElapsed / roundTimeLimit)
        });

        if (roundTimeElapsed >= roundTimeLimit - roundCountDownTicks){
            roundCountDownTicks --;
            sfxCountDown.play();
        }
    }
    else if (roundTimeElapsed >= roundTimeLimit && p1Score == p2Score && !isOvertime){
        isOvertime = true;
        scoreToWin = p1Score + 1;

        timerBars.forEach(bar => {
            bar.width = bgSprite.width
        });
    }
    else if (isOvertime){
        timerBarFlashTimer += app.ticker.deltaMS * 0.001;

        if (timerBarFlashTimer >= timerBarFlashTime){
            timerBarFlashTimer = 0;
            timerBars.forEach(bar => {
                if (bar.visible == true){
                    bar.visible = false;
                }
                else {
                    bar.visible = true;
                }
            });
        }
    }
    else {
        if (p1Score > p2Score){
            roundOver(1);
        }
        else {
            roundOver(2);
        }
    }
}

//Start a round
let startRound = () => {
    resetGameObjects();
    gameRunning = true;
}

let resetGameObjects = () => {
    isMidRound = false;
    titleSprite.visible = false;
    blinder.alpha = 0;
    pauseTxt.alpha = 0;
    pauseTxt2.alpha = 0;
    gameState = 2;
    p1ScoreTxt.text = 0;
    p2ScoreTxt.text = 0;
    p1Score = 0;
    p2Score = 0;
    p1Charge = 0;
    p2Charge = 0;
    isGameOver = false;
    isOvertime = false;
    roundTimeElapsed = 0;
    roundCountDownTicks = 10;
    p1TopNet.visible = true;
    p1MidNet.visible = true;
    p1BotNet.visible = true;
    p2TopNet.visible = true;
    p2MidNet.visible = true;
    p2BotNet.visible = true;
    lastPlayerScored = 0;
    timerBarFlashTimer = 0;
    ballTrailLagCount = 0;
    ballState = 0;
    ballStuck = 0;
    ballStuckTimer = 0;
    ballSpawnTimer = 0;
    p1.y = app.view.height / 2;
    p2.y = app.view.height / 2;
    roverLabels[0].visible = false;

    if (typeof ballSprite != "undefined") {
        ballSprite.x = -100;
        ballSprite.y = -100;
    }

    ballTrail.forEach((ballTrails) => {
        ballTrails.x = -100;
        ballTrails.y = -100;
    })
}

let playerScore = (player, ballX, ballY) => {
    const pointsTopBot = 1;
    const pointsMid = 2;
    const firstDelay = 300;
    const secondDelay = 500;
    let pointsToAward;
    ballExplode.x = ballX;
    //This y offset of 16 shouldn't be necessary
    ballExplode.y = ballY - 16;
    ballExplode.gotoAndPlay(0);

    sfxBallDestroy.play();

    if (ballY > netDivTopY && ballY < netDivBotY) {
        pointsToAward = pointsMid;
    }
    else{
        pointsToAward = pointsTopBot;
    }

    lastPlayerScored = player
    if (player == 1){
        p1Score += pointsToAward;
    }
    else{
        p2Score += pointsToAward;
    }

    if (pointsToAward == 1){

        setTimeout(scoreFX, firstDelay, player);
    }
    else{
        setTimeout(scoreFX, firstDelay, player);
        setTimeout(scoreFX, secondDelay, player);
    }

    if (isOvertime){
        roundOver(player);
    }

    ballState = 0;
    ballSprite.visible = false;
}

let scoreFX = (player) => {
    if (player == 1){
        p1ScoreTxt.text = p1Score;
        sfxPoint.play();
    }
    else{
        p2ScoreTxt.text = p2Score;
        sfxPoint.play();
    }
}

let roundOver = (player) => {
    gameRunning = false;
    roundWinners[round] = player;
    roverLabels[0].visible = true;
    roverLabels[0].text = "";
    roverLabels[3].visible = false;
    roverLabels[4].visible = false;


    let updateRoundOver = () => {
        sfxRoundPoint.play();

        switch (round) {
            case 0:
                if (player == 1) {
                    roverBox[0].gotoAndPlay(1);
                }
                else {
                    roverBox[3].gotoAndPlay(1);
                }
                break;
            case 1:
                if (player == 1) {
                    roverBox[1].gotoAndPlay(1);
                }
                else {
                    roverBox[4].gotoAndPlay(1);
                }
                break;
            case 2:
                if (player == 1) {
                    roverBox[2].gotoAndPlay(1);
                }
                else {
                    roverBox[5].gotoAndPlay(1);
                }
                break;
        }

        round += 1;
        let p1Wins = 0;
        let p2Wins = 0;
        let winner = 0;

        for (i = 0; i < 3; i++) {
            if (roundWinners[i] == 1){
                p1Wins += 1;
            }
            else if (roundWinners[i] == 2){
                p2Wins += 1;
            }
        }

        if (p1Wins >= 2 || p2Wins >= 2){
            if (p1Wins > p2Wins) {
                winner = 1;
            }
            else {
                winner = 2;
            }

            roverLabels[0].text = "WINNER P" + player;
            roverLabels[3].visible = true;
            roverLabels[4].visible = true;
            gameOver();   
        }
        else {
            isMidRound = true;
            setTimeout(startRound, 2500);
        }
    }

    setTimeout(updateRoundOver, 1200);
}

let gameOver = () => {
    gameRunning = false;
    isGameOver = true;
}

let newGameReset = () => {
    round = 0;
    roundWinners = [0,0,0];
    roverLabels[0].text = "";
    roverBox.forEach(rBox => {
        rBox.gotoAndPlay(0);
    })
}

//Game loop logic
let gameLoop = () => {
    if (gameRunning){
        updateGameTimer();
        checkPlayerMovement();
        updatePlayerIndicators();
        updateBall();
    }
}

//Player Input
let setupControls = () =>{
    //Keyboard setup
    keybListener = new window.keypress.Listener();
    keybListener.register_many([
        {
            //P1 Up
            "keys" : "w",
            "on_keydown" : () => {
                menuMove("up");
                p1MoveUp = true;
            },
            "on_keyup" : () => p1MoveUp = false,
            "prevent_repeat" : true
        },
        {
            //P1 Down
            "keys" : "s",
            "on_keydown" : () => {
                menuMove("down");
                p1MoveDown = true;
            },
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
            "on_keydown" : () => {
                menuMove("up");
                p2MoveUp = true;
            },
            "on_keyup" : () => p2MoveUp = false,
            "prevent_repeat" : true
        },
        {
            //P2 Down
            "keys" : "down",
            "on_keydown" : () => {
                menuMove("down");
                p2MoveDown = true;
            },
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
            "on_keydown" : () => {
                pause();
            },
            "prevent_repeat" : true
        },
        {
            //Backspace - used during pause
            "keys" : "backspace",
            "on_keydown" : () => {
                menuReturnFromGame();
            },
            "prevent_repeat" : true
        },
        {
            //Enter - menus only
            "keys" : "enter",
            "on_keydown" : () => {
                menuSelect();
                restartGame();
            },
            "prevent_repeat" : true
        }
    ]);

    //Gamepad setup
    Controller.search();
    window.addEventListener("gc.button.press", (event) => {
        let button = event.detail;
        switch (button.name) {
            case "DPAD_UP":
                if (button.controllerIndex == p1PadIndex){
                    p1MoveUp = true;
                    menuMove("up");
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2MoveUp = true;
                    menuMove("up");
                }
                break;
            case "DPAD_DOWN":
                if (button.controllerIndex == p1PadIndex){
                    p1MoveDown = true;
                    menuMove("down");
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2MoveDown = true;
                    menuMove("down");
                }
                break;
            case "FACE_1":
                if (button.controllerIndex == p1PadIndex){
                    p1Shoot();
                    menuSelect();
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2Shoot();
                    menuSelect();
                }
                break;
            case "FACE_2":
                if (button.controllerIndex == p1PadIndex){
                    p1Super();
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2Super();
                }
                break;
            case "START":
                if (button.controllerIndex == p1PadIndex){
                    pause();
                    restartGame();
                }
                else if (button.controllerIndex == p2PadIndex){
                    pause();
                    restartGame();
                }
                break;
            case "SELECT":
                if (button.controllerIndex == p1PadIndex){
                    menuReturnFromGame();
                }
                else if (button.controllerIndex == p2PadIndex){
                    menuReturnFromGame();
                }
                break;
        }
    }, false);

    window.addEventListener("gc.button.release", (event) => {
        let button = event.detail;
        switch (button.name) {
            case "DPAD_UP":
                if (button.controllerIndex == p1PadIndex){
                    p1MoveUp = false;
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2MoveUp = false;
                }
                break;
            case "DPAD_DOWN":
                if (button.controllerIndex == p1PadIndex){
                    p1MoveDown = false;
                }
                else if (button.controllerIndex == p2PadIndex){
                    p2MoveDown = false;
                }
                break;
        }
    }, false);
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
    else{
        sfxPlayerMiss.play();
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
    else{
        sfxPlayerMiss.play();
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
    if (gameState == 2) {
        if (gameRunning && !isGameOver && !isMidRound) {
            gameRunning = false;
            blinder.alpha = 0.75;
            pauseTxt.alpha = 1;
            pauseTxt2.alpha = 1;
    
            ballHits.forEach(hit => {
                if (hit.playing) {
                    hit.stop();
                }
            })
    
            if (ballExplode.playing) {
                ballExplode.stop();
            }
        }
        else if (!gameRunning && !isGameOver && !isMidRound){
            gameRunning = true;
            blinder.alpha = 0;
            pauseTxt.alpha = 0;
            pauseTxt2.alpha = 0;
    
            ballHits.forEach(hit => {
                if (hit.currentFrame > 0) {
                    hit.play();
                }
            })
    
            if (ballExplode.currentFrame > 0) {
                ballExplode.play();
            }
        }
    }
}

//Update size of player indicators
let updatePlayerIndicators = () => {
    p1Indicator.height = (p1Charge / fullPlayerCharge) * 100;
    p2Indicator.height = (p2Charge / fullPlayerCharge) * 100;
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

        if (player == 1 && p1Charge < fullPlayerCharge){
            p1Charge += 1;
        }
        else if (player == 2 && p2Charge < fullPlayerCharge){
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

let restartGame = () => {
    if (isGameOver && gameState == 2) {
        newGameReset();
        startRound();
    }
}

let menuStart = () => {
    gameState = 1;
    blinder.alpha = 0;
    titleSprite.visible = false;
    menuTxt.visible = false;
    menuTxt2.visible = false;
    menuTxt3.visible = false;
    menuPointers[0].visible = false;
    menuPointers[1].visible = false;
    menuPointerState = 0;
    menuCanPointerChange = false;

    setTimeout(() => {
        sfxTitle.play();
        titleSprite.visible = true;
    }, 900);
    setTimeout(() => {
        sfxPoint.play();
        menuTxt.visible = true;
    }, 1800);
    setTimeout(() => {
        sfxPoint.play();
        menuTxt2.visible = true;
    }, 2000);
    setTimeout(() => {
        sfxPoint.play();
        menuTxt3.visible = true;
    }, 2200);
    setTimeout(menuUpdatePointer, 2700, 0);
    setTimeout(() => menuCanPointerChange = true, 2800);
}

let menuMove = (direc) => {
    if (gameState == 1 && menuCanPointerChange) {
        if (direc == "up") {
            if (menuPointerState == 0) {
                menuUpdatePointer(2);
            }
            else {
                menuUpdatePointer(menuPointerState - 1);
            }
        }
        else if (direc == "down") {
            if (menuPointerState == 2) {
                menuUpdatePointer(0);
            }
            else {
                menuUpdatePointer(menuPointerState + 1);
            }
        }
    }
}

let menuSelect = () => {
    if (gameState == 1 && menuCanPointerChange) {
        switch (menuPointerState) {
            case 0:
                //Start game
                sfxStart.play();
                setTimeout( () => {
                    newGameReset();
                    startRound();
                }, 1000);
                break;
            case 1:
                //How to play
                break;
            case 2:
                //Quit
                break;
        }
    }
}

let menuUpdatePointer = (nextPos) => {
    menuPointerState = nextPos;
    sfxCountDown.play();
    xOffset = 0;
    yOffset = 0;

    switch (menuPointerState) {
        case 0:
            xOffset = menuTxt.width / 2 + menuPointerOffset;
            yOffset = menuTxt.y;
            break;
        case 1:
            xOffset = menuTxt2.width / 2 + menuPointerOffset;
            yOffset = menuTxt2.y;
            break;
        case 2:
            xOffset = menuTxt3.width / 2 + menuPointerOffset;
            yOffset = menuTxt3.y;
            break;
    }

    menuPointers[0].x = xOffset * -1;
    menuPointers[1].x = xOffset;
    menuPointers[0].y = yOffset;
    menuPointers[1].y = yOffset;
    menuPointers[0].visible = true;
    menuPointers[1].visible = true;
}

let menuReturnFromGame = () => {
    if (gameState == 2 && ((!gameRunning && !isMidRound ) || isGameOver)) {
        resetGameObjects();
        menuStart();
    }
}

