function load() {
    var paButton = document.querySelector("#pa-button");
    paButton.addEventListener('click', { number: 3, description: "#pa-description", result: "#pa-result", handleEvent: start_experiment });
    document.querySelector("#ta-button").addEventListener('click', { number: 3, description: "#ta-description", result: "#ta-result", handleEvent: start_experiment });
    document.querySelector("#ka-button").addEventListener('click', { number: 3, description: "#ka-description", result: "#ka-result", handleEvent: start_experiment });
    document.querySelector("#ra-button").addEventListener('click', { number: 3, description: "#ra-description", result: "#ra-result", handleEvent: start_experiment });


}

function sleep(millisecond) {
    var start = new Date();
    while (new Date() - start < millisecond) {
    }
}

var resultList;

function start_experiment() {
    // console.log(this.querySelector)
    // document.querySelector(this.querySelector).innerHTML = number;
    // for (var i = number - 1; i >= 0; i--) {
    //     console.log(i);
    //     sleep(1000);
    //     document.querySelector(this.querySelector).innerHTML = i;
    // }
    // 準備

    // 録音開始
    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        navigator.mozAudioContext ||
        navigator.msAudioContext;
    var audioContext = new window.AudioContext();
    var rec;
    var description = this.description;
    var number = this.number;
    resultList = document.querySelector(this.result);

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function (stream) {
            var start = new Date();
            document.querySelector(description).innerHTML = "実験開始まで" + number + "秒前";
            var x = setInterval(() => {
                var now = new Date();
                document.querySelector(description).innerHTML = "実験開始まで" + (number - Math.round((now - start) / 1000)) + "秒前";
                if (now - start > number * 1000) {
                    var input = audioContext.createMediaStreamSource(stream);
                    gumStream = stream;
                    rec = new Recorder(input, { numChannels: 1 })
                    rec.record();
                    document.querySelector(description).innerHTML = "録音中";
                    document.querySelector(description).setAttribute("style", "color:red");
                    setTimeout(function () {
                        rec.stop();
                        console.log("record has stopeed.");
                        document.querySelector(description).innerHTML = "録音終了";
                        document.querySelector(description).setAttribute("style", "");
                        rec.exportWAV(createDownloadLink);
                    }, 5000);
                    clearInterval(x);
                }
            }, 1000);

        })



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
    resultList.appendChild(li);
}