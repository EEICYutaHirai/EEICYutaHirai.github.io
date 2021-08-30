let width = 640    // We will scale the photo width to this
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
        instruction = document.getElementById('instruction');
        instruction.setAttribute('hidden', true);
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
    var blob = new Blob(record_data, { type: 'video/webm' })
    // uploadRef.put(blob).then(function (snapshot) {
    //     location.href = "./" + next_word + ".html?id=" + String(experimentId);
    // }).catch(function (e) {
    //     document.getElementById("error-upload").setAttribute('style', 'color:red;');
    //     console.log(e);
    // });
    video.style.display = 'none';
    description.innerHTML = 'アップロード中';
    description.setAttribute('style', 'color:blue;')

    var bar = new ProgressBar.Circle(progressbar, {
        color: '#aaa',
        // This has to be the same size as the maximum width to
        // prevent clipping
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: { color: '#aaa', width: 1 },
        to: { color: '#333', width: 4 },
        // Set default step function for all animate calls
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * 100);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '2rem';
    uploadRef.put(blob).on('state_changed', function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes);
        bar.animate(progress);
        console.log('Upload is ' + progress * 100 + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        document.getElementById("error-upload").setAttribute('style', 'color:red;');
        console.log(e);
    }, function () {
        location.href = "./" + next_word + ".html?id=" + String(experimentId);
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
