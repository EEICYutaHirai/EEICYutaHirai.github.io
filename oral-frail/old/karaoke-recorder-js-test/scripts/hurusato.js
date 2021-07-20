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
    var startAudioButton = document.querySelector("#activate-audio");
    var stopAudioButton = document.querySelector("#stop-audio");
    var recordingDiv = document.querySelector("#recording");
    //var statusDiv = document.querySelector(".status");

    var mediaRecorder = null;
    var recordStream;

    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        navigator.mozAudioContext ||
        navigator.msAudioContext;
    var audioContext = new window.AudioContext();
    var rec;
    var gumStream;

    startAudioButton.addEventListener("click", function () {
        startAudioButton.setAttribute("style", "display:none;");
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function (stream) {
                // 許可されてから録音と楽曲の再生を開始する。
                recordingDiv.setAttribute("style", "color: red;");

                var input = audioContext.createMediaStreamSource(stream);
                gumStream = stream;
                rec = new Recorder(input, { numChannels: 1 })
                playMusic();

                rec.record();
            })
            .catch(function (e) {
                console.log(e);
            });
        //statusDiv.innerHTML = "<div>Testing browser</div>";

    });

    stopAudioButton.addEventListener("click", function () {
        rec.stop();
        //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        timingCallbacks.stop();
        recordingDiv.setAttribute("style", "display:none;");
        startAudioButton.setAttribute("style", "");
        stopAudioButton.setAttribute("style", "display:none;");
        if (midiBuffer)
            midiBuffer.stop();
        rec.exportWAV(createDownloadLink);
    });

    function playMusic() {
        if (ABCJS.synth.supportsAudio()) {
            timingCallbacks.start();
            // show stop button
            stopAudioButton.setAttribute("style", "");

            // An audio context is needed - this can be passed in for two reasons:
            // 1) So that you can share this audio context with other elements on your page.
            // 2) So that you can create it during a user interaction so that the browser doesn't block the sound.
            // Setting this is optional - if you don't set an audioContext, then abcjs will create one.
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
    }

    function createDownloadLink(blob) {

        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');
        var li = document.createElement('li');
        var link = document.createElement('a');

        //name of .wav file to use during upload and download (without extendion)
        var filename = new Date().toISOString();

        //add controls to the <audio> element
        au.controls = true;
        au.src = url;

        //save to disk link
        link.href = url;
        link.download = filename + ".wav"; //download forces the browser to donwload the file using the  filename
        link.innerHTML = "Save to disk";

        //add the new audio element to li
        li.appendChild(au);

        //add the filename to the li
        li.appendChild(document.createTextNode(filename + ".wav "))

        //add the save to disk link to li
        li.appendChild(link);

        //upload link
        var upload = document.createElement('a');
        upload.href = "#";
        upload.innerHTML = "Upload";
        upload.addEventListener("click", function (event) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function (e) {
                if (this.readyState === 4) {
                    console.log("Server returned: ", e.target.responseText);
                }
            };
            var fd = new FormData();
            fd.append("audio_data", blob, filename);
            xhr.open("POST", "upload.php", true);
            xhr.send(fd);
        })
        li.appendChild(document.createTextNode(" "))//add a space in between
        li.appendChild(upload)//add the upload link to li

        //add the li element to the ol
        recordingsList.appendChild(li);
    }

    var lastEls = [];
    function colorElements(els) {
        var i;
        var j;
        for (i = 0; i < lastEls.length; i++) {
            for (j = 0; j < lastEls[i].length; j++) {
                lastEls[i][j].classList.remove("highlight");
            }
        }
        for (i = 0; i < els.length; i++) {
            for (j = 0; j < els[i].length; j++) {
                els[i][j].classList.add("highlight");
            }
        }
        lastEls = els;
    }

    function eventCallback(ev) {
        if (ev)
            colorElements(ev.elements);
    }

}