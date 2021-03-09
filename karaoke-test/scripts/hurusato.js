var hurusato = "T: ふるさと\n" +
    "M: 3/4\n" +
    "K: G\n" +
    "L: 1/4\n" +
    "G2 G2 G2|A3 B A2|B2 B2 c2|d4 z2|\n" +
    "w:う さ ぎ| お い し | か の や|ま\n" +
    "c2 d2 e2|B3 c B2|A2 A2 F2|G4 z2|\n" +
    "w: こ ぶ な |つ り し|か の か |わ\n" +
    "AG A2 D2|GA B2 B2|cB (c3 e)|dc B2 z2|\n" +
    "w: ゆ ー め は|い ー ま も|め ー ぐ ー |り ー て\n" +
    "d2 d2 d2|G3 A B2| c2 c2 A2| G4 z2:|\n" +
    "w: わ す れ|が た き|ふ る さ|と";

function load() {
    // music notation(hurusato) => SVG image
    // show SVG image on "paper"
    var visualObj = ABCJS.renderAbc("paper", hurusato, {
        responsive: "resize"
    })[0];
    var timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
        eventCallback: eventCallback
    });

    // This object is the class that will contain the buffer
    var midiBuffer;
    var startAudioButton = document.querySelector(".activate-audio");
    var stopAudioButton = document.querySelector(".stop-audio");
    var recordingDiv = document.querySelector(".recording");
    //var statusDiv = document.querySelector(".status");

    var mediaRecorder = null;
    var recordStream;

    startAudioButton.addEventListener("click", function () {
        timingCallbacks.start();
        startAudioButton.setAttribute("style", "display:none;");
        recordingDiv.setAttribute("style", "color: red;");
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (recordStream) {
                localstream = recordStream;
                mediaRecorder = new MediaRecorder(recordStream);
                mediaRecorder.start();
            })
            .catch(function (e) {
                console.log(e);
            });
        //statusDiv.innerHTML = "<div>Testing browser</div>";
        if (ABCJS.synth.supportsAudio()) {
            // show stop button
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
            // then: 成功した場合に実行される。
            audioContext.resume().then(function () {
                // This does a bare minimum so this object could be created in advance, or whenever convenient.
                midiBuffer = new ABCJS.synth.CreateSynth();

                // midiBuffer.init preloads and caches all the notes needed. There may be significant network traffic here.
                return midiBuffer.init({
                    visualObj: visualObj,
                    audioContext: audioContext
                }).then(function (response) {
                    // response => cached, error, loaded を含むjson
                    console.log(response); // this contains the list of notes that were loaded.
                    // midiBuffer.prime actually builds the output buffer.
                    // buildするだけ。必要な作業はこれからしないといけない。
                    return midiBuffer.prime();
                }).then(function () {
                    // At this point, everything slow has happened. midiBuffer.start will return very quickly and will start playing very quickly without lag.
                    // start audio
                    midiBuffer.start();
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
        }
    });

    stopAudioButton.addEventListener("click", function () {
        mediaRecorder.stop();
        mediaRecorder.ondataavailable = function (e) {
            document.getElementById('player').src = URL.createObjectURL(e.data);
        }
        localstream.getTracks().forEach(track => track.stop());
        timingCallbacks.stop();
        recordingDiv.setAttribute("style", "display:none;");
        startAudioButton.setAttribute("style", "");
        stopAudioButton.setAttribute("style", "display:none;");
        if (midiBuffer)
            midiBuffer.stop();
    });



    var lastEls = [];
    function colorElements(els) {
        var i;
        var j;
        for (i = 0; i < lastEls.length; i++) {
            for (j = 0; j < lastEls[i].length; j++) {
                lastEls[i][j].classList.remove("color");
            }
        }
        for (i = 0; i < els.length; i++) {
            for (j = 0; j < els[i].length; j++) {
                els[i][j].classList.add("color");
            }
        }
        lastEls = els;
    }

    function eventCallback(ev) {
        if (ev)
            colorElements(ev.elements);
    }

}