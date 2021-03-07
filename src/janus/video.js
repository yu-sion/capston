/*
  Janus Screen Sharing Connect

  server : EC2 Ubuntu 18.04 version
  DNS : sinjuku.o-r.kr
  Janus Port : 8088
  server address : 52.90.174.10
  use server : apache2

  connect janus server link : http://sinjuku.o-r.kr/janus
  git url : https://github.com/hyj7484/janusWebrtc.git
*/
/*
    남은 것 :
    리펙토링
*/
import Janus from "./janus";
import $ from 'jquery';
import axios from "axios";
/*
    npm install jquery
    npm install --save react-spinners

*/

export const VideoState = {
  server: "https://sinjuku.o-r.kr/janus",
  janus: null,
  plugin: null,
  room: null,
  sessionId: null,
  userId: null,
  userState: null,
  capture: null,
  role: null,
  source: null,
  spinner: null,
  janusState : null,
  videoTag : null,
  recorder : null,
  fileName : null,
  videoId : null,
}

export const setVideoId_Video = (argVideoId) => {
  VideoState.videoId = argVideoId;
}
const getVideoId = (argVideoId) => {
  return VideoState.videoId;
}

export const setFileName_Video = (argFileName) => {
  VideoState.fileName = argFileName;
}
const getFileName = () => {
  return VideoState.fileName;
}

const setRecorder = (argRecorder) => {
  VideoState.recorder = argRecorder;
}
export const getRecorder_Video = () => {
  return VideoState.recorder;
}

export const getJanusState_Video = () => {
  return VideoState.janusState;
}
const setJanusState = (argState) => {
  VideoState.janusState = argState;
}

const setJanus = (argJanus) => {
  VideoState.janus = argJanus;
}
const getJanus = () => {
  return VideoState.janus;
}

const setPlugin = (argPlugin) => {
  VideoState.plugin = argPlugin;
}
export const getPlugin_Video = () => {
  return VideoState.plugin;
}

export const setRoom_Video = (argRoom) => {
  VideoState.room = argRoom;
}
export const getRoom_Video = () => {
  return VideoState.room;
}

const setSessionId = (argSessionId) => {
  VideoState.sessionId = argSessionId;
}

const setUserId = (argUserId) => {
  VideoState.userId = argUserId;
}
const getUserId = () => {
  return VideoState.userId;
}

export const setUserState_Video = (argUserState) => {
  VideoState.userState = argUserState;
}
const getUserState = () => {
  return VideoState.userState;
}

const setCapture = (argCapture) => {
  VideoState.capture = argCapture;
}
const getCapture = () => {
  return VideoState.capture;
}

const setRole = (argRole) => {
  VideoState.role = argRole;
}
const getRole = () => {
  return VideoState.role;
}

const setSource = (argSource) => {
  VideoState.source = argSource;
}
const getSource = () => {
  return VideoState.source;
}

const setSpinner = (argSpinner) => {
  VideoState.spinner = argSpinner;
}
const getSpinner = () => {
  return VideoState.spinner;
}
const setVideoTag = (argVideo) => {
  VideoState.videoTag = argVideo;
}
const getVideoTag = () => {
  return VideoState.videoTag;
}


export const JanusStart_Video = () => {
  console.log("video start");
  Janus.init({
    debug : "all",
    callback : () => {
      if(!Janus.isWebrtcSupported()){
        return;
      }
      VideoState.janus = createJanus();
    }
  });
}

const createJanus = () => {
  return new Janus({
    server : VideoState.server,
    success : () => {
      getJanus().attach({
        plugin : "janus.plugin.videoroom",
        opaqueId : randomString(12),
        success : (pluginHandle) => {
          setPlugin(pluginHandle);
          if(getUserState() == "join"){
            joinScreen();
          }else if(getUserState() == "create"){
            preSharingScreen_Video();
          }else{
            console.log("null");
          }
        },
        error : (error) => {
          Janus.error(" -- Error attaching plugin ... ", error);
          console.error("Error attaching plugin... " + error);
        },
        consentDialog : (on) => {
          Janus.debug("Consent dialog should be " + (on ? "on" : "off") + "now");
        },
        iceState : (state) => {
          Janus.log("ICE state changed to " + state);
        },
        mediaState : (medium, on) => {
          Janus.log("Janus " + (on ? "started" : "stopped") + "receiving our " + medium);
        },
        webrtcState : (on) => {
          Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
          // $("#video_view").parent().unblock();
          if(on) {

          }else {
            let onClose = () => {
              getJanus().destroy();
              window.location.reload();
            };
          }
        },
        onmessage : (msg, jsep) => {
          Janus.debug(" ::: Got a message (publisher) :::", msg);
          var event = msg['videoroom'];
          Janus.debug("Event : " + event);
          if(event) {
            if(event === "joined"){
              setUserId(msg['id']);
              Janus.log("Successfully joined room " + msg['room'] + " with ID " + getUserId());
              if(getRole() === "publisher"){
                Janus.debug("Negotiating WebRTC stream for our screen (capture " + getCapture() + ")");
                if(Janus.webRTCAdapter.browserDetails.browser === "safari") {
                  // 브라우저가 사파리 일때
                    getPlugin_Video().createOffer({
                      media : {
                        video : getCapture(),
                        audioSend : true,
                        videoRecv : false,
                      },
                      success : (jsep) => {
                        Janus.debug("Got publisher SDP!", jsep);
                        var publish = {
                          request : "configure",
                          audio : true,
                          video : true,
                        };
                        getPlugin_Video().send({
                          message : publish,
                          jsep : jsep,
                        });
                      },
                      error : (error) => {
                        Janus.error("WebRTC error ... ", error );
                        console.error("WebRTC error ..." + error.message);
                      },
                    });
                }else {
                  getPlugin_Video().createOffer({
                    media : {
                      video : getCapture(),
                      audioSned : true,
                      videoRecv : false,
                    },
                    success : (jsep) => {
                      Janus.debug("Got publisher SDP! ", jsep);
                      var publish = {
                        request : "configure",
                        audio : true,
                        video : true
                      };
                      getPlugin_Video().send({
                        message : publish,
                        jsep : jsep,
                      });
                    },
                    error : (error) => {
                      Janus.error("WebRTC error : ", error);
                      console.error("WebRTC error ..." + error.message);
                    }
                  });
                }
              } else {
                if (msg['publishers']){
                  var list = msg['publishers'];
                  Janus.debug("Got a list of available publishers/feeds : ", list);
                  for (var f in list) {
                    var id = list[f]['id'];
                    var display = list[f]['display'];
                    Janus.debug(" >> [" + id + "] " + display);
                    // newRemoteFeed function add
                    newRemoteFeed(id, display);
                  }
                }
              }
            }else if (event === "event") {
              if(getRole() === "listener" && msg['publishers']){
                var list = msg['publishers'];
                Janus.debug("Got a list of available publishers/feeds : ", list);
                for (var f in list) {
                  var id = list[f]['id'];
                  var display = list[f]['id'];
                  Janus.debug(" >> [" + id + "] " + display);
                  // newRemoteFeed function add
                  newRemoteFeed(id, display);
                }
              }else if ( msg['leaving'] ){
                var leaving = msg['leaving'];
                Janus.log("Publisher left : " + leaving);
                if(getRole() === "listener" && msg['leaving'] === getSource()) {
                  let onClose = () =>{
                    window.location.reload();
                  };
                }
              } else if ( msg['error' ]){
                console.error(msg['error']);
              }
            }
          }
          if ( jsep ){
            Janus.debug("Handling SDP as well... ", jsep);
            getPlugin_Video().handleRemoteJsep({
              jsep : jsep,
            });
          }
        },
        onlocalstream : (stream) => {

          Janus.debug(" ::: Got a local stream ::: ", stream);
          console.log(stream);
          if($('#camvideo').length === 0){
            $("#video_view_Cam").append('<video class="rounded centered" id="camvideo" width="100%" height="100%" autoplay playsinline controls />');
            setVideoTag(document.getElementById('camvideo'));
          }
          console.log(stream.getAudioTracks());

          let camvideo = document.getElementById('camvideo');
          camvideo.volume = 1;
          Janus.attachMediaStream($("#camvideo").get(0), stream);
          camvideo.currentTime = 0;

          const recordStartPlay = (stream) => {
            camvideo.srcObject = stream;
            camvideo.captureStream = camvideo.captureStream || camvideo.mozCaptureStream;
            return new Promise(resolve => camvideo.onplaying = resolve);
          }
          let promiseObj = new Promise((resolve, reject) => {
            resolve();
            reject();
          });

          promiseObj.then(() => {
          }).then(() => {
            recordStartPlay(stream).then(
              () => startRecording(camvideo.captureStream())
            ).then(recordedChunks => {
              let recordedBlob = new Blob(recordedChunks, {
                type : 'video/mp4',
              });
              console.log(recordedBlob);

              const xhr = new XMLHttpRequest();
              // http://54.146.88.72:3000/file/uploadvideo/20
              if(getFileName() === null){
                setFileName_Video('noFileName');
              }

              const url = 'http://54.146.88.72:3000/file/uploadvideoNODB/';
              console.log(url);
              xhr.open('POST', url, false);

              const formData = new FormData();
              formData.append('file', recordedBlob, getFileName() + ".mp4");
              xhr.send(formData);
              const data = { file : formData};
            }).catch((err) => {
              alert(err);
            })
          });
        },
        oncleanup : () => {
          Janus.log(" ::: Got a cleanup notification ::: ");
        },
      });
    },
    error : (error) => {
      Janus.error(error);
      console.error(error);
    },
    destroyed : () => {
      console.log("destroyed");
      window.location.reload();
    }
  });
}

export const preSharingScreen_Video = () => {
  if(!Janus.isExtensionEnabled()) {
    console.error("You 're using Chorme but don't have the screensharing extension installed: click <b><a  href='https://chrome.google.com/webstore/detail/janus-webrtc-screensharin/hapfgfdkleiggjjpfpenajgdnfckjpaj' target='_blank'>here</a></b> to do so");
    return;
  }
  setCapture("");
  // shareScreen function add
  shareScreen();
}

const shareScreen = () => {
  var desc = randomString(12, "0123456789");
  setRole("publisher");
  var create = {
    request : "create",
    description : desc,
    bitrate : 500000,
    publishers : 1
  };
  getPlugin_Video().send({
    message : create,
    success : (result) => {
      console.log(result);
      var event = result['videoroom'];
      Janus.debug("Event: " + event);
      console.log(event);
      if(event) {
        console.log(result['room']);
        setRoom_Video(result['room']);
        Janus.log("Screen sharing session created: " + getRoom_Video());
        var userName = randomString(12);
        var register = {
          request : "join",
          room : getRoom_Video(),
          ptype : "publisher",
          display : userName,
        };
        getPlugin_Video().send({
          message : register,
        });
      }
    }
  });
  setJanusState('true');
}

export const joinScreen = () => {
  console.log("join Screen");
  console.log(getRoom_Video());
  if(isNaN(getRoom_Video())){
    return;
  }
  var room = parseInt(getRoom_Video());
  console.log(room);
  setRole("listener");
  var userName = randomString(12);
  var register = {
    request : "join",
    room : room,
    ptype : "publisher",
    display : userName,
  };
  getPlugin_Video().send({
    message : register,
  });
}

const newRemoteFeed = (id, display) => {
  console.log(id);
  setSource(id);
  var remoteFeed = null;
  getJanus().attach({
    plugin : "janus.plugin.videoroom",
    opaqueId : randomString(12),
    success : (pluginHandle) => {
      remoteFeed = pluginHandle;
      Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id= " + remoteFeed.getId() + ")");
      Janus.log(" -- This is a subscriber ");
      let room = parseInt(getRoom_Video());
      var listen = {
        request : "join",
        room : room,
        ptype : "listener",
        feed : id
      };
      remoteFeed.send({
        message : listen,
      });
    },
    error : (error) => {
      Janus.error(" -- Error attaching plugin... ", error);
      console.error("Error attaching plugin ... " + error);
    },
    onmessage : (msg, jsep) => {
      console.log(msg);
      Janus.debug(" ::: Got a message (listener) ::: ", msg);
      var event = msg['videoroom'];
      Janus.debug("Event : " + event);
      if(event){
        if(event === "attached") {
          if(!getSpinner()){
            var target = document.getElementById("video_view_Cam");
            console.log(target);
            // setSpinner(new Spinner({
            //   top : 100
            // }).spin(target));
          }else {
            getSpinner().spin();
          }
          console.log(msg['room']);
          setRoom_Video(msg['room']);
          Janus.log("Successfully attached to feed " + id + " (" + display + ") in room " + msg["room"]);
        }else {
          // null
        }
      }
      if(jsep) {
        Janus.debug("Handling SDP as well...", jsep);
        console.log(remoteFeed);
        remoteFeed.createAnswer({
          jsep : jsep,
          media : {
            audioSend : false,
            videoSend : false
          },
          success : (jsep) => {
            Janus.debug("Got SDP!", jsep);
            var body = {
              request : "start",
              room : getRoom_Video(),
            };
            remoteFeed.send({
              message : body,
              jsep : jsep,
            });
          },
          error : (error) => {
            Janus.error("WebRTC error : ", error);
            console.error("WebRTC error ... " + error);
          },
        });
      }
    },
    onremotestream : (stream) => {
      console.log("onremoteStream")
      if($("#camvideo").length === 0){
        $("#video_view_Cam").append('<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />');
        $("#video_view_Cam").append('<video class="rounded centered hide" muted id="camvideo" width="100%" height="100%" playsinline/>');
        console.log($('#camvideo'));
        $("#camvideo")[0].volume = 0;

        $("#camvideo").bind("playing", () => {
          $("#waitingvideo").remove();
          $("#sceenvideo").removeClass('hide');
          if(getSpinner()){
            getSpinner().stop();
          }
          setSpinner(null);
        });
      }
      Janus.attachMediaStream($("#camvideo")[0], stream);
      console.log($("#camvideo"));
      $("#camvideo")[0].play();
      $("#camvideo")[0].volume = 1;
    },
    oncleanup : () => {
      Janus.log(" ::: Got a cleanup notification ( remote feed " + id + ") ::: ");
      $("waitingvideo")[0].remote();
      if(getSpinner()){
        getSpinner().stop();
      }
      setSpinner(null);
    }
  });
}


const randomString = (len, charSet) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

const startRecording = (stream) => {
  let recorder = new MediaRecorder(stream);
  setRecorder(recorder);
  let data = [];

  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });
  console.log(data);
  return Promise.all([
    stopped
  ]).then(() => data);
}
