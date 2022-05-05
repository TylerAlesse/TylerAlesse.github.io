if(!(navigator.userAgent.indexOf("Firefox") > -1)) {
    let sketchScript = document.createElement("script");
    sketchScript.src = "sketch.js";
    document.querySelector("body").appendChild(sketchScript);
} else {
    console.error("FIREFOX NOT SUPPORTED!");
    alert("Sorry! This game does not currently support Firefox.");
}