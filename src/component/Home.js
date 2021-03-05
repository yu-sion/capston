import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import axios from "axios";
import Subject from "./Subject";
import "../css/Home.css";
import { render } from "@testing-library/react";

export default class Home extends React.Component{
    constructor(props){
        super(props);
        const usrData = JSON.parse(localStorage.getItem('data_user')) || null; // UserData
        this.state = {
            userData : usrData,  // userMail, userName, userNum, userPhone userType
        }
        console.log(this.state.userData);
        this.serverUrl = {
            server      : "http://54.146.88.72:3000/",
            InfoChange  : "http://54.146.88.72:3000/main/modifyuser/",                 // 정보 수정  => userId , data => name, mail, phone
            getSubject  : "http://54.146.88.72:3000/list/subject/",                    // 과목 목록 => userId
            createsub   : "http://54.146.88.72:3000/main/createsub/",                  // 과목 추가  => userId,  data => sub_name 
            StdPermit   : "http://54.146.88.72:3000/list/student/",                    // 학생 가입 대기중인 List 가져오기 => classId
            userAccept  : "http://54.146.88.72:3000/main/accept/",                     // 학생 가입 수락 / 거절  =>userId/:classId/:accept
            fileId      : "http://54.146.88.72:3000/file/add/",                        // 파일 추가용 Id 받기 => :userId/:fileType/:subjectId/    
            fileUpload  : "http://54.146.88.72:3000/file/uploadteachingmeterial/",     // 파일 ID를 fileId axios에서 받아와 업로드
            fileList    : "http://54.146.88.72:3000/list/teachingmeterial/",           // 파일 리스트 classId
        }
    }

    InfoChange = () => {
        return (
            <div id="Home_Logo_InfoChange" className="Home_Logo_UserInfo_Change_Body" style={{
                display:"none",
            }}>
                <div className="Home_Logo_UserInfo_Change_Logo"> 정보 수정 </div>
                <div className="Home_Logo_UserInfo_Change_Content"> 
                    <input className="Home_Logo_UserInfo_Change_Input" id="name" type="text" name="name" defaultValue={this.state.userData.userName} /> <br/>
                    <input className="Home_Logo_UserInfo_Change_Input" id="email" type="text" name="email" defaultValue={this.state.userData.userMail} /> <br/>
                    <input className="Home_Logo_UserInfo_Change_Input" id="phone" type="text" name="phone" defaultValue={this.state.userData.userPhone} /> <br/>
                </div>
                <div>
                    <button onClick={this.userDataChange}> 수정하기 </button>
                </div>
            </div>
        )
    }

    infoChangeFunc = () =>{
        const element = document.getElementById('Home_Logo_InfoChange');
        if(element.style.display == "none"){
            element.style.display = "block";
        }
        else{
            element.style.display = "none";
        }
    }

    userDataChange = async () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const data = {
            name : name,
            mail : email,
            phone : phone,
        }
        const url = this.serverUrl.InfoChange + this.state.userData.id;
        await axios.post(url , {data} ).then((result)=>{
            const usrData = {
                // id, userMail, userName, userNum, userPhone userType
                id : this.state.userData.id,
                userMail : email,
                userName : name,
                userNum : this.state.userData.userNum,
                userPhone : phone,
                userType : this.state.userData.userType,
            }
            localStorage.setItem('data_user', JSON.stringify(usrData));
            this.setState({
                userData : usrData, 
            })
        }).catch((err) => {
            console.error("정보수정 에러 " + err);
        });
        this.infoChangeFunc();
    }

    logout =() => {
        // const history = useHistory();
        // localStorage.clear();
        // return history.push('');
    }

    componentDidMount(){
        console.log(this.state);
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.userData != prevState){

        }
    }

    render(){

        return (
            <div className="Home_Main">
                <div className="Home_Logo_Frame_Body"> 
                    <div className="Home_Logo_Img"> 로고 </div>
                    <div className="Home_Logo_UserInfo_Change_Frame"> 
                        <this.InfoChange />
                    </div>
                    <div className="Home_Logo_UsrData">  
                        <div className="Home_Logo_User_Name"> {this.state.userData.userName}  </div>
                        <div className="Home_Logo_Btn">
                            <button className="Home_Logo_Btn_InfoChange" onClick={this.infoChangeFunc}> 정보수정 </button>
                            <button className="Home_Logo_Btn_Logout" onClick={this.logout}> 로그아웃 </button>
                        </div>
                    </div>
                </div>
                <div className="Home_Content_Body">
                    <Subject userData={this.state.userData} serverUrl={this.serverUrl} />
                </div>
            </div>
        )   
    }
}
