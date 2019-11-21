/* eslint-disable */
import video_css from 'video.js/dist/video-js.min.css';
import videojs from 'video.js';

import 'webrtc-adapter';
import RecordRTC from 'recordrtc';
import $ from 'jquery';
import { config_host } from './config';

// the following imports are only needed when you're recording
// audio-only using the videojs-wavesurfer plugin
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
WaveSurfer.microphone = MicrophonePlugin;

// register videojs-wavesurfer plugin
import wavesurfer_css from 'videojs-wavesurfer/dist/css/videojs.wavesurfer.css';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';


// register videojs-record plugin with this import
import record_css from 'videojs-record/dist/css/videojs.record.css';
import Record from 'videojs-record/dist/videojs.record.js';

var url = new URL(window.location.href);
var type = url.searchParams.get("type");
if(!type) type = "video"

var player;
const elementId = 'myVideo';
var playerOptions = {
    controls: true,
    autoplay: false,
    fluid: false,
    loop: false,
    width: 320,
    height: 240,
    controlBar: {
        volumePanel: false
    },
    plugins: {
        wavesurfer: {

        },
        // configure videojs-record plugin
        record: {
            audio: false,
            video: false
        }
    }
};

    
// wait till DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if(type=="audio"){
        $("#switchBetween").html("Switch to Video")
        playerOptions.plugins.record.audio = true;
        playerOptions.plugins.wavesurfer = {src: 'live', waveColor: '#36393b', progressColor: 'black', debug: true, cursorWidth: 1, msDisplayMax: 20, hideScrollbar: true};
        playerOptions.plugins.record.video = false;
    }else{
        playerOptions.plugins.record.video = {mandatory: {minWidth: 1280,minHeight: 720}, debug: true}
        playerOptions.plugins.record.audio = false  
    }
 $("#switchBetween").click(function(){
    if(type=="audio") window.location.href= "http://localhost:8080/?type=video"   
    else window.location.href= "http://localhost:8080/?type=audio"
    });  
    // if(type=="audio") applyAudioWorkaround();

    // create player
    player = videojs(elementId, playerOptions, function() {
        // print version information at startup
        var msg = 'Using video.js ' + videojs.VERSION +
            ' with videojs-record ' + videojs.getPluginVersion('record') +
            ', videojs-wavesurfer ' + videojs.getPluginVersion('wavesurfer') +
            ', wavesurfer.js ' + WaveSurfer.VERSION + ' and recordrtc ' +
            ' and recordrtc ' + RecordRTC.version;
        videojs.log(msg);
    });

    // device is ready
    player.on('deviceReady', function() {
        console.log('device is ready!');
    });

    // user clicked the record button and started recording
    player.on('startRecord', function() {
        console.log('started recording!');
    });

    // user completed recording and stream is available
    player.on('finishRecord', function() {
        // the blob object contains the recorded data that
        // can be downloaded by the user, stored on server etc.
        console.log('finished recording: ', player.recordedData);
    });

    // error handler
    player.on('error', function(element, error) {
        console.error(error);
    });

    player.on('deviceError', function() {
        console.error(player.deviceErrorCode);
    });
    console.log(player)
    $("#save").click(function(e){
        e.preventDefault();

        var formData = new FormData();
        formData.append('video', player.recordedData);
        formData.append('type', type);

        $.ajax({
            type: "POST",
            url: config_host()+'/webrtc/webrtc/upload-video.php',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log(response);
                alert("Uploaded to server.")
            }
        })
    });
});

