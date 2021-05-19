let width = 320    // We will scale the photo width to this
let height = 0     // This will be computed based on the input stream

let streaming = false

let video = null
let canvas = null
let photo = null
let startbutton = null
let constrains = {
    audio: true,
    video: {
        facingMode: "user"  // どのカメラを利用するか
    }
};

let recorder = null
let record_data = []

window.AudioContext = window.AudioContext ||
    window.webkitAudioContext ||
    navigator.mozAudioContext ||
    navigator.msAudioContext;
let audioContext = new window.AudioContext();

const current_word = window.location.href.split('/').pop().split('.')[0];
if (current_word != "pa") {
    document.getElementById("descriptionExplainingSame").setAttribute("style", "");
}

let patakara_words = document.getElementsByClassName("patakara-word");
console.log(patakara_words);
console.log(patakara_words[0]);
for (let i = 0; i < patakara_words.length; i++) {
    console.log(patakara_words[i]);

    switch (current_word) {
        case "pa": patakara_words[i].innerHTML = "パ"; break;
        case "ta": patakara_words[i].innerHTML = "タ"; break;
        case "ka": patakara_words[i].innerHTML = "カ"; break;
        case "ra": patakara_words[i].innerHTML = "ラ"; break;
        default: next_word = "karaoke-description"; break;
    }
}

let next_word = "";
switch (current_word) {
    case "pa": next_word = "ta"; break;
    case "ta": next_word = "ka"; break;
    case "ka": next_word = "ra"; break;
    default: next_word = "karaoke-description"; break;
}

function startup() {
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    photo = document.getElementById('photo')
    startbutton = document.getElementById('startbutton')
    stopbutton = document.getElementById('stopbutton')
    uploadbutton = document.getElementById('upload')

    videoStart()

    //メディアが再生できるようになったとき
    video.addEventListener('canplay', function (ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width)

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            streaming = true;
        }
    }, false)

    //startRecorder()

    startbutton.addEventListener('click', function (ev) {
        startbutton.setAttribute('style', 'display:none');
        description.setAttribute('style', '');

        // countdown
        let count = 3;
        let start = new Date();
        description.innerHTML = "実験開始まで" + count + "秒前";
        let x = setInterval(function () {
            let now = new Date();
            description.innerHTML = "実験開始まで" + Math.ceil((count - (now - start) / 1000)) + "秒前";
            if ((count - (now - start) / 1000) < 0) {
                recorder.start();
                ev.preventDefault();

                description.innerHTML = "録画中";
                description.setAttribute('style', 'color:red;')

                setTimeout(function () {
                    recorder.stop();
                    //uploadVideo();
                    //description.setAttribute('style', 'display:none;');
                    //uploadbutton.setAttribute('style', '');
                    //document.getElementById('next-page').setAttribute('style', 'display:none;');

                }, 5000);

                clearInterval(x);
            }
        }, 100);




    }, false);
}

function uploadVideo() {
    var firebaseConfig = {
        apiKey: "AIzaSyBoc4yB0ufBepHvS2IZqfRM2C4i3xtgAxQ",
        authDomain: "oralfrailexperiment-19fa7.firebaseapp.com",
        projectId: "oralfrailexperiment-19fa7",
        storageBucket: "oralfrailexperiment-19fa7.appspot.com",
        messagingSenderId: "550131966506",
        appId: "1:550131966506:web:31e8df4ba565a295ded953"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    storageRef = firebase.storage().ref();

    experimentId = window.location.search.slice(4);
    var uploadRef = storageRef.child(experimentId + "/" + current_word + '-' + String(Date.now()) + '.webm');
    console.log(record_data[0])
    console.log(record_data)
    var blob = new Blob(record_data, { type: 'video/webm' })
    uploadRef.put(blob).then(function (snapshot) {
        //location.href = "./" + next_word + ".html?id=" + String(experimentId);
    }).catch(function (e) {
        document.getElementById("error-upload").setAttribute('style', 'color:red;');
        console.log(e);
    });
}

/**
 * カメラ操作を開始する
 */

function videoStart() {
    streaming = false
    navigator.mediaDevices.getUserMedia(constrains)
        .then(function (stream) {
            video.srcObject = stream
            // video.play()
            recorder = new MediaRecorder(stream)
            recorder.ondataavailable = function (e) {
                // var testvideo = document.getElementById('test')
                // testvideo.setAttribute('controls', '')
                // testvideo.setAttribute('width', width)
                // testvideo.setAttribute('height', height)
                //var outputdata = window.URL.createObjectURL(e.data)
                if (e.data.size > 0) {
                    record_data.push(e.data);
                    uploadVideo();
                }
                // testvideo.src = outputdata
            }
            input = audioContext.createMediaStreamSource(stream);
            gumStream = stream;
        })
        .catch(function (err) {
            console.log("An error occured! " + err)
        })
}

function startRecorder() {
    navigator.mediaDevices.getUserMedia(constrains)
        .then(function (stream) {
            recorder = new MediaRecorder(stream)
            recorder.ondataavailable = function (e) {
                // var testvideo = document.getElementById('test')
                // testvideo.setAttribute('controls', '')
                // testvideo.setAttribute('width', width)
                // testvideo.setAttribute('height', height)
                var outputdata = window.URL.createObjectURL(e.data)
                record_data.push(e.data)
                // testvideo.src = outputdata
            }
        })
}

startup()
