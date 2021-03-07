import React from "react";
import { JanusStart, setUserState, setRoom } from "../janus/screensharing";
import { JanusStart_Video, setUserState_Video, setRoom_Video } from "../janus/video";
import io from 'socket.io-client';
import axios from 'axios';
// npm i axios
// npm install socket.io-client


import Note from "./Note";
import "../css/StdClass.css";
import ImgLogo from "../img/logo.png";
/*
    학생 페이지
    Data set :
    StdId : 학생 ID
    ClassId : 수업 ID
    Marker Data List : 마킹 Event 실행시 데이터 list 저장
    screen Room Id : 화면 공유 받을 screen Room Number
*/
/*
  남은 것
  노트, 마킹시간 DB 저장
  페이지 이동 시키는거
*/
export default class StdClass extends React.Component{
  constructor(props){
    super(props);

    const classId = props.classId || 1;
    const stdId = props.stdId || Math.floor(Math.random() * 5) + 1;
    const className = props.className || "No Class";
    const teacherName = props.teacherName || "No Name";
    const videoId = props.videoId || 12;

    this.state = {
      socket : null,
      stdId : stdId,
      classId : classId,
      screenRoomId : stdId,
      markerDataList : [],
      className : className,
      teacherName : teacherName,
      videoId : videoId,
    };
    this.url = {
      getRoom : "http://54.146.88.72:3000/main/getroom/",
      setMarker : "http://54.146.88.72:3000/mark/insert/",
      setNote : "http://54.146.88.72:3000/memo/write/",  //video id, user id
      socket : {
        connect : "http://54.146.88.72:3000",
        markerReq : "markerReq",
        markerRes : "markerRes",
        handsup : "handsup",
        end : 'endRoom',
      },
    };
  }

  handsup = (e) => {
    const data = {
      roomId : this.state.classId,
      bool : true,
      stdId : this.state.stdId,
    };
    this.state.socket.emit(this.url.socket.handsup, data);
  }

  marker = () => {
    const data = {
      roomId : this.state.classId,
      stdId : this.state.stdId,
    };
    this.state.socket.emit(this.url.socket.markerReq, data);
  }

  getRoom = async () => {
    const url = this.url.getRoom + this.state.classId;
     await axios.get(url, {}).then((req) => {
       console.log(req);
       console.log(req.data.classRanNum);
       const roomObj = JSON.parse(req.data.classRanNum);
       console.log(roomObj);
       this.setState({
         screenRoomId : roomObj.screenRoom,
         videoRoomId : roomObj.videoRoom,
       });
     })
    .catch((err) => {alert(err);});
  }

  componentDidMount(){
    this.getRoom();
    if(this.state.socket == null){
    const socket = io.connect(this.url.socket.connect);
    const data = {
      roomId : this.state.classId,
      type : "student",
      id : this.state.stdId,
    }
    socket.emit('joinRoom', data);
      this.setState({
        socket : socket,
      });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    if(this.state.screenRoomId != prevState.screenRoomId){
      /*
          Janus Screen Sharing start
          Janus state set : join
          setRoom : state.screenRoomId
          setUserState : join
          JanusStart call
      */
      setRoom(this.state.screenRoomId);
      setRoom_Video(this.state.videoRoomId);
      setUserState('join');
      setUserState_Video('join');
      JanusStart();
      JanusStart_Video();
    }
    if(this.state.markerDataList != prevState.markerDataList){
      console.log(this.state.markerDataList);
    }

    if(this.state.socket != prevState.socket){
      this.state.socket.on(this.url.socket.markerReq, (msg) => {
        console.log(msg);
      });
      this.state.socket.on(this.url.socket.markerRes, (msg) => {
        console.log(msg);
        const list = this.state.markerDataList;
        if(msg.stdId === this.state.stdId){
          list.push(msg.time);
          console.log(list);
          this.setState({
            markerDataList : list
          });
        }
      });
      this.state.socket.on(this.url.socket.handsup, (msg) => {
        console.log(msg);
        console.log(this.state.stdId === msg.stdId);
        const btn = document.getElementById("StdClass_Btn_Handsup");
        if(this.state.stdId == msg.stdId || msg.stdId === "all"){
          btn.disabled = msg.bool;
        }
      });
      this.state.socket.on(this.url.socket.end, async (msg) => {
        /*
          Class End
          Marking Data Save to DB
          Page Move ? : Where ?
          if No Move : Exit Btn make ?
        */
        const sendMarker = async () => {
          const url = this.url.setMarker + this.state.videoId + "/" + this.state.stdId;
          const data = { tag : JSON.stringify(this.state.markerDataList)};
          console.log(typeof data.tag);
          await axios.post(url, {data}).then((req) => {
            console.log(req);
          });
          console.log("set Marker");
        }
        const sendNote = async() => {
          const noteElement = document.getElementById('Note_Text');
          const url = this.url.setNote + this.state.videoId + "/" + this.state.stdId;
          const data = { content : noteElement.innerHTML}
          console.log(data);
          await axios.post(url, {data}).then( req => {
            console.log(req);
          });
          console.log("set Note");
        }
        sendMarker();
        sendNote();
        console.log(msg);
      });
    }
  }

  View_video = () => {
    return (
      <div className="StdClass_Video_Body">
        <div className="StdClass_Video_Video" id="video_view"></div>
      </div>
    )
  }

  test = () => {
    this.state.socket.emit(this.url.socket.end, {roomId : this.state.classId});
    console.log("end play");
  }

  camVideo_View = () => {
    return (
      <div className="StdClass_Video_Cam_Body">
        <div className="StdClass_Video_Cam_Video" id="video_view_Cam"></div>
      </div>
    )
  }

  View_underbar = () => {
    return (
      <div className="StdClass_UnderBar_Body">
        <div className="StdClass_UnderBar_Button">
          <button className="StdClass_Btn_HandsUp" id="StdClass_Btn_Handsup" onClick={this.handsup}> HandsUp </button>
          <button className="StdClass_Btn_Marker" onClick={this.marker}> Marker </button>
        </div>
      </div>
    )
  }

  View_Logo = () => {
    return (
      <div className="StdClass_Logo_Body">
        <div className="StdClass_Logo_Img">
          <img className="StdClass_Logo_Img_Get" src={ImgLogo} />
        </div>
        <div className="StdClass_Logo_ClassName">
        {this.state.className}
        </div>
        <div className="StdClass_Logo_TeacherName">
        {this.state.teacherName}
        </div>
      </div>
    )
  }
  render(){
    return (
      <div className="StdClass_Main_Frame">
        <div className="StdClass_Logo_Frame">
          <this.View_Logo />
        </div>
        <div className="StdClass_Content_Frame">
          <div className="StdClass_Video_Frame"> <this.View_video /> </div>
          <div className="StdClass_Right_Frame">
            <div>
              <div className="StdClass_Cam_Video" id="video_view_Cam"> video </div>
            </div>
            <div className="StdClass_Note_Frame">
              <Note />
            </div>
            <div className="StdClass_UnderBar_Frame">
              <this.View_underbar />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
