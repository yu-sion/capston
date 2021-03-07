import React from "react";

import {
  JanusStart,
  setUserState,
  getRoom,
  getRecorder,
  setFileName,
  preSharingScreen,
  setVideoId,
} from "../janus/screensharing";
import {
  JanusStart_Video,
  setUserState_Video,
  getRoom_Video,
  getRecorder_Video,
  setFileName_Video,
  preSharingScreen_Video,
  setVideoId_Video,
} from "../janus/video";
import io from 'socket.io-client';
import axios from 'axios';
import "../css/TeacherClass.css";
/*
    state :
    classId - Subject Id
    className - Subject Name
    screenRoomId - Janus Screen Sharing Room Id
    socket - socket io
*/
/*
    기능 :
    영상 공유
    영상 저장
    Time send
    C# 실행

*/

/*
  남은 것
  디자인

  페이지 이동시키는거
*/
export default class TeacherClass extends React.Component{
  constructor(props){
    super(props);

    const classId = props.classId || 1;
    const usrId = props.userId || 2;
    const className = props.className || "No Class";
    const fileName = props.fileName || "NoFile";
    const videoId = props.videoId || 20;
    setVideoId(videoId);
    setVideoId_Video(videoId);
    this.state = {
      classId : classId,
      className : className,
      userId : usrId,
      screenRoomId : null,
      socket : null,
      fileName : fileName,
    }

    this.url = {
      insertRoom : "http://54.146.88.72:3000/main/updateroom/",
      socket : {
        connect : "http://54.146.88.72:3000",
        markerReq : 'markerReq',
        markerRes : 'markerRes',
        end : 'endRoom',
      }
    }
  }

  setJanusRoomToDb = () => {
    const roomObj = {
      screenRoom : getRoom(),
      videoRoom : getRoom_Video(),
    }
    const data = {
      roomNum : JSON.stringify(roomObj)
    }
    const url = this.url.insertRoom + this.state.classId + "/";
     axios.post(url, {data}).then((msg) => {console.log(msg);}).catch((err) => {alert(err);});
  }

  getTime = () =>{
    const video = document.getElementById('screenvideo');
    return video.currentTime;
  }

  componentDidMount(){
    // window.open('sinzuku://');
    if(this.state.socket == null){
      const socket = io.connect(this.url.socket.connect);
      const data = {
        roomId : this.state.classId,
        type : "teacher",
        id : this.state.userId,
      };
      socket.emit('joinRoom', data);
      this.setState({
        socket : socket,
      });
    }
    setUserState('create');
    setUserState_Video('create');
    if(getRoom() == null && getRoom_Video() == null){
      JanusStart();
      JanusStart_Video();
    }


    const playInterval = setInterval(()=>{
      console.log(getRoom());
      console.log(getRoom_Video());
      if(getRoom() != null && getRoom_Video() != null){
        this.setState({
          screenRoomId : getRoom(),
          videoRoomId : getRoom_Video(),
        });
        clearInterval(playInterval);
      }else{
        console.log("Janus room Set wait");
      }
    }, 500);
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if(this.state.screenRoomId != prevState.screenRoomId){
      this.setJanusRoomToDb();
    }

    if(this.state.socket != prevState.socket){
      this.state.socket.on(this.url.socket.markerReq, (msg) => {
        console.log(msg);
        const data = {
          roomId : this.state.classId,
          stdId : msg.stdId,
          time : this.getTime(),
        }
        this.state.socket.emit(this.url.socket.markerRes, data);
      });
      this.state.socket.on(this.url.socket.markerRes, (msg) => {
        console.log(msg);
      });
      this.state.socket.on(this.url.socket.end, async (msg) => {
        /*
          Class End
          Recorder Stop
          Recorder Data Save
          Page Back
        */
        console.log(msg);
        let nowDate = new Date();
        const year = nowDate.getYear() + 1900;
        const month = nowDate.getMonth() > 9 ? nowDate.getMonth() + 1 : "0" + ( nowDate.getMonth() + 1 );
        const day = nowDate.getDate() > 9 ? nowDate.getDate() + 1 : "0" + ( nowDate.getDate() + 1 );
        console.log(this.state);
        nowDate = year + "" + month + "" + day;
        const fileName =  this.state.classId + "_" + nowDate + "_" + this.state.fileName;
        setFileName(fileName);
        setFileName_Video(fileName + "_video");
        console.log(fileName);
        const recordStop_screen = getRecorder().stop();
        const recordStop_video = getRecorder_Video().stop();
        console.log(msg);
      });
    }
  }
  View_Video = () => {

  }
  test = () => {
    const data = {roomId : this.state.classId};
    this.state.socket.emit(this.url.socket.end, data);
  }
  render(){
    return (
      <div className="TeacherClass_Main_Frame">
      <button onClick={this.test}> endtest </button>
        <div className="TeacherClass_SharingVideo">
          <div className="TeacherClass_Video" id="video_view"> </div>
          <div className="TeacherClass_Video" id="video_view_Cam"> </div>
        </div>
      </div>
    )
  }
}
