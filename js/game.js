let app;
let p1;
let p1Score;
let p1ScoreTxt;
let p2;
let p2Score;
let p2ScoreTxt;
let bgSprite;
let ballSprite;
let ballAngle;
let keys = {};

//Setup after loading
window.onload = function(){
    app = new PIXI.Application(
        {
            width: 800,
            height: 600,
            backgroundColor: 0x0D0D0D
        }
    );
    
    //Add pixi to body
    document.body.appendChild(app.view);

    //Styling
    document.body.style.backgroundColor = "#0D0D0D";
    document.body.style.display = "flex";
    document.body.style.justifyContent = "center";
    document.body.style.flexDirection = "column";

    //SetupFunctions
    setupUI();
    setupPlayers();
    setupLevel();
    startRound();

    
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
    app.ticker.add(gameLooop);
}

function setupPlayers() {
    const offsetFromEdge = 50;

    //Setup player 1
    p1 = new PIXI.Sprite.from("images/Paddle.png");
    p1.anchor.set(0.5);
    p1.x = p1.width / 2 + offsetFromEdge;
    p1.y = app.view.height / 2;
    p1.zIndex = 11;
    app.stage.addChild(p1);
    p1Score = 0;
    
    //Setup player 2
    p2 = new PIXI.Sprite.from("images/Paddle.png");
    p2.anchor.set(0.5);
    p2.x = app.view.width - offsetFromEdge + p2.width / 2;
    p2.y = app.view.height / 2;
    p2.zIndex = 10;
    app.stage.addChild(p2);
    p2Score = 0;
}


function setupLevel(){
    //Setup the play area sprite
    bgSprite = new PIXI.Sprite.from("images/PlayArea.png");
    bgSprite.anchor.set(0.5);
    bgSprite.x = app.view.width / 2;
    bgSprite.y = app.view.height / 2;
    bgSprite.zIndex = 0;
    app.stage.addChild(bgSprite);
}

function setupUI(){
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

function createBall(){
    bgSprite = new PIXI.Sprite.from("images/Ball.png");
    bgSprite.anchor.set(0.5);
    bgSprite.x = app.view.width / 2;
    bgSprite.y = (app.view.height / 2 - 100) + Math.floor(Math.random() * 200);
    bgSprite.zIndex = 20;
    app.stage.addChild(bgSprite);
}

function startRound(){
    createBall();
}

function keysDown(e) {
    keys[e.keyCode] = true;
}

function keysUp(e) {
    keys[e.keyCode] = false;
}

function gameLooop(){
    if (keys["87"]){
        player.y -= 5;
    }

    if (keys["65"]){
        player.x -= 5;
    }

    if (keys["83"]){
        player.y += 5;
    }

    if (keys["68"]){
        player.x += 5;
    }
}