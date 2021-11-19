 let scaleMe = (pixi) => {
    let scale;

    if (pixi.view.width > pixi.view.height) {
        if (pixi.view.height * (window.innerWidth / app.view.width) < window.innerHeight) {
            scale = window.innerWidth / app.view.width;
        }
        else {
            scale = window.innerHeight / app.view.height;
        }
    }
    else {
        if (pixi.view.width * (window.innerHeight / app.view.height) < window.innerWidth) {
            scale = window.innerHeight / app.view.Height;
        }
        else {
            scale = window.innerWidth / app.view.width;
        }
    }

    document.body.style.paddingLeft = "0px";
    document.body.style.paddingRight = "0px";
    document.body.style.paddingTop = "0px";
    document.body.style.paddingBottom = "0px";
    document.body.style.display = "block";
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";

    document.body.transformOrigin = "center center";
    document.body.style.transform = "scale(" + scale + "", " + scale)";

    document.body.style.marginLeft = (window.innerWidth - pixi.view.width) / 2 + "px";
    document.body.style.marginRight = (window.innerWidth - pixi.view.width) / 2 + "px";
    document.body.style.marginTop = (window.innerHeight - pixi.view.height) / 2 + "px";
    document.body.style.marginBottom = (window.innerHeight - pixi.view.height) / 2 + "px";

}