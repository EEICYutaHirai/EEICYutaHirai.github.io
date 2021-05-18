const hurusato = "T: ふるさと\n" +
    "M: 3/4\n" +
    "K: G\n" +
    "L: 1/8\n" +
    "Q: 1/4=80\n" +
    "d2 d2 d2|G3 A B2| c2 c2 A2| G4 z2\n" +
    "G2 G2 G2|A3 B A2|B2 B2 c2|d4 z2|\n" +
    "w:う さ ぎ| お い し | か の や|ま\n" +
    "c2 d2 e2|B3 c B2|A2 A2 F2|G4 z2|\n" +
    "w: こ ぶ な |つ り し|か の か |わ\n" +
    "AG A2 D2|GA B2 B2|cB (c3 e)|dc B2 z2|\n" +
    "w: ゆ ー め は|い ー ま も|め ー ぐ ー |り ー て\n" +
    "d2 d2 d2|G3 A B2| c2 c2 A2| G4 z2\n" +
    "w: わ す れ|が た き|ふ る さ|と";

let hurusato_music = "";

// for video recording
let width = 320    // We will scale the photo width to this
let height = 0     // This will be computed based on the input stream
let streaming = false
let video = null
let canvas = null
let photo = null
let startbutton = null
let constrains = { video: true, audio: true }
let recorder = null
let record_data = []
let input;

function load() {
    console.log(hurusato);
    // show SVG image on "paper"
    var visualObj = ABCJS.renderAbc("paper", hurusato, {
        responsive: "resize",
        clickListener: ({ midiPitches }) => {
            console.log("midiPitches", midiPitches);
        }
    })[0];


    // This object is the class that will contain the buffer
    var midiBuffer;
    const startAudioButton = document.querySelector("#startbutton");
    const stopAudioButton = document.querySelector("#stopbutton");

    var mediaRecorder = null;
    var recordStream;

    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        navigator.mozAudioContext ||
        navigator.msAudioContext;
    var audioContext = new window.AudioContext();
    var rec;
    var gumStream;

    // for video recording
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    photo = document.getElementById('photo')
    startbutton = document.getElementById('startbutton')
    stopbutton = document.getElementById('stopbutton')
    downloadbutton = document.getElementById('download')

    videoStart();


    var timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
        eventCallback: eventCallback,
        beatCallback: function (beatNumber, totalBeats, totalTime) {
            console.log(beatNumber + ' ' + totalBeats + ' ' + totalTime);
            // 楽曲が終了したとき
            if (beatNumber == totalBeats) {
                description.setAttribute('style', 'display:none;');
                recorder.stop();
                // downloadbutton.setAttribute('style', '');
                uploadVideo();
                console.log(hurusato_music);
            }
        }
    });

    video.addEventListener('canplay', function (ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width)

            video.setAttribute('width', width)
            video.setAttribute('height', height)
            streaming = true
        }
    }, false)

    startAudioButton.addEventListener("click", function () {
        startAudioButton.setAttribute("style", "display:none;");

        description.innerHTML = "録画中";
        description.setAttribute('style', 'color:red');
        playMusic();
        recorder.start();

        //statusDiv.innerHTML = "<div>Testing browser</div>";

    });

    // stopAudioButton.addEventListener("click", function () {
    //     rec.stop();
    //     //stop microphone access
    //     gumStream.getAudioTracks()[0].stop();

    //     timingCallbacks.stop();
    //     recordingDiv.setAttribute("style", "display:none;");
    //     startAudioButton.setAttribute("style", "");
    //     stopAudioButton.setAttribute("style", "display:none;");
    //     if (midiBuffer)
    //         midiBuffer.stop();
    //     rec.exportWAV(createDownloadLink);
    // });

    function playMusic() {
        if (ABCJS.synth.supportsAudio()) {
            // show stop button
            // stopAudioButton.setAttribute("style", "");

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
                    timingCallbacks.start();
                    return Promise.resolve();
                }).catch(function (error) {
                    if (error.status == "NotSupported") {
                        stopAudioButton.setAttribute("style", "display:none;");
                        var audioError = document.querySelector(".audio-error");
                        audioError.setAttribute("style", "");
                    } else
                        console.warn("synth error", error);
                });
            });
        }
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

        if (ev) {
            console.log(ev);
            colorElements(ev.elements);
            console.log(hurusato[ev.startChar]);
            hurusato_music += hurusato.slice(ev.startChar, ev.endChar).replace(/[0-9]/g, "").replace(/\s/g, "").replace(/\(/g, "").replace(/\)/g, "")
                + ", " + ev.milliseconds + "\n";
        }
    }

    function videoStart() {
        streaming = false
        console.log(streaming)
        navigator.mediaDevices.getUserMedia(constrains)
            .then(function (stream) {
                video.srcObject = stream
                // video.play()
                recorder = new MediaRecorder(stream)
                recorder.ondataavailable = function (e) {
                    var testvideo = document.getElementById('test')
                    testvideo.setAttribute('controls', '')
                    testvideo.setAttribute('width', width)
                    testvideo.setAttribute('height', height)
                    var outputdata = window.URL.createObjectURL(e.data)
                    record_data.push(e.data)
                    testvideo.src = outputdata
                }
                input = audioContext.createMediaStreamSource(stream);
                gumStream = stream;
            })
            .catch(function (err) {
                console.log("An error occured! " + err)
            })
    }

    // function startRecorder() {
    //     navigator.mediaDevices.getUserMedia(constrains)
    //         .then(function (stream) {
    //             recorder = new MediaRecorder(stream)
    //             recorder.ondataavailable = function (e) {
    //                 var testvideo = document.getElementById('test')
    //                 testvideo.setAttribute('controls', '')
    //                 testvideo.setAttribute('width', width)
    //                 testvideo.setAttribute('height', height)
    //                 var outputdata = window.URL.createObjectURL(e.data)
    //                 record_data.push(e.data)
    //                 testvideo.src = outputdata
    //             }
    //         })
    // }

}