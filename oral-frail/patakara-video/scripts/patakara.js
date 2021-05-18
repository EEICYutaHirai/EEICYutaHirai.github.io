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

    startRecorder()

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
                    uploadVideo();
                    //description.setAttribute('style', 'display:none;');
                    recorder.stop();
                    //uploadbutton.setAttribute('style', '');
                    //document.getElementById('next-page').setAttribute('style', 'display:none;');

                }, 5000);

                clearInterval(x);
            }
        }, 100);




    }, false);
}

/**
 * カメラ操作を開始する
 */

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