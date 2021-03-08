var hurusato = "T: ふるさと\n" + 
                "M: 3/4\n" + 
                "K: G\n" +
                "G2 G2 G2|A3 B A2|B2 B2 c2|d4 z2|\n" +
                "c2 d2 e2|B3 c B2|A2 A2 F2|G4 z2|\n" +
                "AG A2 D2|GA B2 B2|cB (c3 e)|dc B2 z2|\n" +
                "d2 d2 d2|G3 A B2| c2 c2 A2| G4 z2:|";

function load() {
    // First draw the music - this supplies an object that has a lot of information about how to create the synth.
    // NOTE: If you want just the sound without showing the music, use "*" instead of "paper" in the renderAbc call.
    var visualObj = ABCJS.renderAbc("paper", hurusato, {
        responsive: "resize" })[0];

    // This object is the class that will contain the buffer
    var midiBuffer;

    var startAudioButton = document.querySelector(".activate-audio");
    var stopAudioButton = document.querySelector(".stop-audio");
    var explanationDiv = document.querySelector(".suspend-explanation");
    var statusDiv = document.querySelector(".status");

    startAudioButton.addEventListener("click", function() {
        startAudioButton.setAttribute("style", "display:none;");
        explanationDiv.setAttribute("style", "opacity: 0;");
        statusDiv.innerHTML = "<div>Testing browser</div>";
        if (ABCJS.synth.supportsAudio()) {
            stopAudioButton.setAttribute("style", "");

            // An audio context is needed - this can be passed in for two reasons:
            // 1) So that you can share this audio context with other elements on your page.
            // 2) So that you can create it during a user interaction so that the browser doesn't block the sound.
            // Setting this is optional - if you don't set an audioContext, then abcjs will create one.
            window.AudioContext = window.AudioContext ||
                window.webkitAudioContext ||
                navigator.mozAudioContext ||
                navigator.msAudioContext;
            var audioContext = new window.AudioContext();
            audioContext.resume().then(function () {
                statusDiv.innerHTML += "<div>AudioContext resumed</div>";
                // In theory the AC shouldn't start suspended because it is being initialized in a click handler, but iOS seems to anyway.

                // This does a bare minimum so this object could be created in advance, or whenever convenient.
                midiBuffer = new ABCJS.synth.CreateSynth();

                // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
                return midiBuffer.init({
                    visualObj: visualObj,
                    audioContext: audioContext,
                    millisecondsPerMeasure: visualObj.millisecondsPerMeasure()
                }).then(function (response) {
                    statusDiv.innerHTML += "<div>Audio object has been initialized</div>";
                    // console.log(response); // this contains the list of notes that were loaded.
                    // midiBuffer.prime actually builds the output buffer.
                    return midiBuffer.prime();
                }).then(function () {
                    statusDiv.innerHTML += "<div>Audio object has been primed</div>";
                    // At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
                    midiBuffer.start();
                    statusDiv.innerHTML += "<div>Audio started</div>";
                    return Promise.resolve();
                }).catch(function (error) {
                    if (error.status === "NotSupported") {
                        stopAudioButton.setAttribute("style", "display:none;");
                        var audioError = document.querySelector(".audio-error");
                        audioError.setAttribute("style", "");
                    } else
                        console.warn("synth error", error);
                });
            });
        } else {
            var audioError = document.querySelector(".audio-error");
            audioError.setAttribute("style", "");
        }
    });

    stopAudioButton.addEventListener("click", function() {
        startAudioButton.setAttribute("style", "");
        explanationDiv.setAttribute("style", "");
        stopAudioButton.setAttribute("style", "display:none;");
        if (midiBuffer)
            midiBuffer.stop();
    });
}