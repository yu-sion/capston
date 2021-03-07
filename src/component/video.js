import React, { Component } from 'react';
import VideoPlayer from 'react-video-markers';
// npm install react-video-markers --save



export default class Video extends Component {
  constructor(props){
    super(props);
    const url = props.url;
    const marker = props.marker;
    this.state = {
      marker : marker,
      url : url,
      isPlaying: false,
      volume: 0.7
    }
  }

  handlePlay = () => {
    this.setState({isPlaying: true});
  };

  handlePause = () => {
    this.setState({isPlaying: false});
  };

  handleVolume = value => {
    this.setState({volume: value});
  };

  componentDidMount(){
    this.setVideo();
  }

  componentDidUpdate(){

  }

  setVideo = () => {
    const vid = document.getElementsByClassName('react-video-player')[0];
    const camVideo = document.getElementById('Cam_Video');

    vid.addEventListener('loadedmetadata', function () {
      console.log(vid.duration);
        if (vid.duration == Infinity) {
            vid.currentTime = 1e101;
            camVideo.currentTime = 1e101;
            console.log(vid.duration);
            vid.ontimeupdate = function () {
                this.ontimeupdate = () => {
                    return;
                }
                vid.currentTime = 0;
                camVideo.currentTime = 0;
                return;
            }
        }
    });
    vid.ontimeupdate = () => {
      console.log(camVideo.currentTime);
      console.log(camVideo.currentTime - vid.currentTime);
      if(camVideo.currentTime - vid.currentTime > 1 || camVideo.currentTime - vid.currentTime < -1 ){
        console.log("??");
        camVideo.currentTime = vid.currentTime;
        if(camVideo.paused){
            camVideo.play();
        }
      }
    }
  }

  render () {

    return ( <VideoPlayer
      url={this.state.url}
      isPlaying={this.state.isPlaying}
      volume={this.state.volume}
      onPlay={this.handlePlay}
      onPause={this.handlePause}
      onVolume={this.handleVolume}
      markers={this.props.marker}
      width="100%"
      height="100%"
     />
   )
  }
}
