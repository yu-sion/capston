
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

const JanusState = {
  server: "https://sinjuku.o-r.kr/janus",
  capture : null,
  role : null,
  userState: null,
}

export const setCapture = (argCapture) => {
  // screen => 화면 캡처, else 캠
  JanusState.capture = argCapture === "screen" ? argCapture : "";
}
const getCapture = () => {
  return JausState.capture;
}

const setRole = (argRole) => {
  JanusState.role = argRole;
}
const getRole = () => {
  return JanusState.role;
}

export const setUserState = (argState) => {
  JanusState.userState = argState;
}
const getUserState = () => {
  return JanusState.userState;
}

export const ScreenState = {
  janus: null,
  plugin: null,
  recorder : null,
  fileName : null,
  capture : null,
}
export const VideoState = {
  janus : null,
  plugin : null,
  recorder : null,
  fileName : null,
  capture : null,
}

export const ScreenStart = () => {
  Janus.init({
    debug : "all",
    callback : () => {
      if(!Janus.isWebrtcSupported()){
        return;
      }
      if(getCapture() == "screen"){
        ScreenState.janus = createJanus();
      }else{
        VideoState.janus = createJanus();
      }
    }
  });
}

const createJanus = () => {
  const capture = getCapture();
  return new Janus({
    server : ScreenState.server,
    success : () => {
      ScreenState.janus.attach({
        plugin : "janus.plugin.videoroom",
        opaqueId : randomString(12),
        success : (pluginHandle) => {
          if(capture == "screen"){
              ScreenState.plugin = pluginHandle;
          }else{
            VideoState.plugin = pluginHandle;
          }
            if(getUserState() == "join"){
              joinScreen();
            }else if(getUserState() == "create"){
              preSharingScreen();
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
        },
        onmessage : (msg, jsep) => {
          Janus.debug(" ::: Got a message (publisher) :::", msg);
          var event = msg['videoroom'];
          Janus.debug("Event : " + event);
          if(event) {
            if(event === "joined"){
              Janus.log("Successfully joined room " + msg['room'] + " with ID " + getUserId());
              if(getRole() === "publisher"){
                Janus.debug("Negotiating WebRTC stream for our screen (capture " + getCapture() + ")");
                if(Janus.webRTCAdapter.browserDetails.browser === "safari") {
                  // 브라우저가 사파리 일때
                    getPlugin().createOffer({
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
                        getPlugin().send({
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
                  getPlugin().createOffer({
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
                      getPlugin().send({
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
            getPlugin().handleRemoteJsep({
              jsep : jsep,
            });
          }
        },
        onlocalstream : (stream) => {

          Janus.debug(" ::: Got a local stream ::: ", stream);
          console.log(stream);
          if($('#camvideo').length === 0){
            $("#video_view").append('<video class="rounded centered" id="camvideo" width="100%" height="100%" autoplay playsinline controls />');
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
                setFileName('noFileName');
              }

              const url = 'http://54.146.88.72:3000/file/uploadvideo/20';
              xhr.open('POST', 'http://54.146.88.72:3000/file/uploadvideo/20', false);

              const formData = new FormData();
              formData.append('file', recordedBlob, getFileName() + ".mp4");
              xhr.send(formData);
              const data = { file : formData};
              console.log("휴학");
              // axios.post(url, data).then(res => {
              //   console.log(res);
              // }).catch(err => console.error(err));
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

export const preSharingScreen = () => {
  if(!Janus.isExtensionEnabled()) {
    console.error("You 're using Chorme but don't have the screensharing extension installed: click <b><a  href='https://chrome.google.com/webstore/detail/janus-webrtc-screensharin/hapfgfdkleiggjjpfpenajgdnfckjpaj' target='_blank'>here</a></b> to do so");
    return;
  }
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
  getPlugin().send({
    message : create,
    success : (result) => {
      console.log(result);
      var event = result['videoroom'];
      Janus.debug("Event: " + event);
      console.log(event);
      if(event) {
        console.log(result['room']);
        setRoom(result['room']);
        Janus.log("Screen sharing session created: " + getRoom());
        var userName = randomString(12);
        var register = {
          request : "join",
          room : getRoom(),
          ptype : "publisher",
          display : userName,
        };
        getPlugin().send({
          message : register,
        });
      }
    }
  });
  setJanusState('true');
}

export const joinScreen = () => {
  console.log("join Screen");
  console.log(getRoom());
  if(isNaN(getRoom())){
    return;
  }
  var room = parseInt(getRoom());
  console.log(room);
  setRole("listener");
  var userName = randomString(12);
  var register = {
    request : "join",
    room : room,
    ptype : "publisher",
    display : userName,
  };
  getPlugin().send({
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
      let room = parseInt(getRoom());
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
            var target = document.getElementById("video_view");
            console.log(target);
            // setSpinner(new Spinner({
            //   top : 100
            // }).spin(target));
          }else {
            getSpinner().spin();
          }
          console.log(msg['room']);
          setRoom(msg['room']);
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
              room : getRoom(),
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
        $("#video_view").append('<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />');
        $("#video_view").append('<video class="rounded centered hide" muted id="camvideo" width="100%" height="100%" playsinline/>');
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
  console.log(getRecorder());
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
