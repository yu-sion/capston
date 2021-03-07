import React from "react";
import Video from './video';
import axios from 'axios';

import Note from "./Note";
import "../css/replay.css";
import ImgLogo from "../img/logo.png";

/*
  남은 것
  디자인, 노트

  라이브러리 오류 났다가 안났다가함 ?? 왜이럼 ??

  페이지 이동시키는거
*/

export default class Replay extends Video{
  constructor(props){
    super(props);
    console.log(props);
    console.log('constructor');
    const fileArrayS = props.data.fileName ? props.data.fileName.split('.') : null;

    const fileName = props.data.fileName;
    const videoId= props.data.videoId;
    const stdId = props.data.stdId || 1;
    const classId = props.data.classId || 1;
    const className = props.data.className || "Not ClassName";
    const videoName = fileArrayS ? fileArrayS[0] + "_video.mp4" : "1_20210308_NoFile_video.mp4";
    this.state = {
      videoId : videoId,
      fileName : fileName,
      stdId : stdId,
      classId : classId,
      className : className,
      markers : null,
      videoName : videoName,
    }

    this.url = {
      marker : "http://54.146.88.72:3000/mark/get/",
      video : "http://54.146.88.72:3000/file/getvideo/",
    }
  }

  note_mount = () => {
    const addChild = document.getElementsByClassName('react-video-controls')[0];
    const speedOption = document.createElement('select');
    speedOption.className = "Replay_video_speedSet"
    let array = [];
    const speedList = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    for(let i = 0; i < speedList.length; i++){
      const option = document.createElement('option');
      option.innerHTML = speedList[i];
      option.value = speedList[i];
      if(speedList[i] == 1){
        option.setAttribute('selected', true);
      }
      array.push(document.createElement('option'));
      speedOption.appendChild(option);
    }
    addChild.appendChild(speedOption);

    speedOption.addEventListener('change', (event) => {
      let video = document.getElementsByClassName('react-video-player')[0];
      video.playbackRate = speedOption.value;
    });
  }

  getMarker = async () => {
    const url = this.url.marker + this.state.videoId + "/" + this.state.stdId;
    await axios.post(url, {}).then((req)=>{
      console.log(req);
      const data = req.data.result[0];
      console.log(data);
      if(data != null){
        const list = JSON.parse(data.tag).map((list, index) => {
          return {id : index, time : list, color : '#ffc837', title : 'maker ' + index};
        });
        this.setState({
          markers : list
        });
        // Video.changeStateMarker({
        //   marker : list
        // })
      }else{
        this.setState({
          markers : []
        });
      }

    }).catch((err)=>{alert(err);});
  }

  async componentDidMount(){
    this.note_mount();
    await this.getMarker();
    this.setVideo();

  }

  View_UnderBar = () => {
    return (
      <div className="Replay_UnderBar_Body">
      </div>
    )
  }

  View_Logo = () => {
    return (
      <div className="Replay_Logo_Body">
        <div className="Replay_Logo_Img">
          <img className="Replay_Logo_Img_Get" src={ImgLogo} />
        </div>
      </div>
    )
  }

  render () {
    console.log("render");
    const url = this.url.video + this.state.fileName;
    const videoUrl = this.url.video + this.state.videoName;
    const marker = this.state.markers || [
      {id : 1, time : 5, color : '#ffc837', title : 'maker 1'},
        {id : 1, time : 10, color : '#ffc837', title : 'maker 1'},
    ];
    console.log(this.state.markers);
    return (
      <div className="Replay_Main_Frame">
        <div className="Replay_Logo_Frame">
          <this.View_Logo />
        </div>
        <div className="Replay_Body_Frame">
          <div className="Replay_Video_Frame">
            <Video marker={marker} url={url} />
          </div>
          <div className="Replay_Note_Frame">
            <div className="Replay_Cam_Video">
              <video autoplay muted width="300" height="300" src={videoUrl} id="Cam_Video" controls> </video>
            </div>
            <Note stdId={this.state.stdId} videoId={this.state.videoId}/>
          </div>
        </div>
        <div className="Replay_UnderBar_Frame">
          <this.View_UnderBar />
        </div>
      </div>
    )
  }
}
