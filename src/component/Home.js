import React from "react";
import axios from "axios";
import { Link } from 'react-router-dom'
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

        const url = "http://54.146.88.72:3000/";
        console.log(this.state.userData);
        this.serverUrl = {
            server      :  url,
            InfoChange  :  url + "main/modifyuser/",                  // 정보 수정  => userId , data => name, mail, phone
            getSubject  :  url + "list/subject/",                     // 과목 목록 => userId
            createsub   :  url + "main/createsub/",                   // 과목 추가  => userId,  data => sub_name 
            infoSub     :  url + "main/updateclassname/",            // 과목 수정 => :classId            
            delSub      :  url + "delete/class/",                     // 과목 삭제 =>:classId
            StdPermit   :  url + "list/student/",                     // 학생 가입 대기중인 List 가져오기 => classId
            userAccept  :  url + "main/accept/",                      // 학생 가입 수락 / 거절  =>userId/:classId/:accept
            typeId      :  url + "file/add/",                         // 파일 추가용 Id 받기 => :userId/:fileType/:subjectId/    
            fileUpload  :  url + "file/uploadteachingmeterial/",           // 파일 ID를 fileId axios에서 받아와 업로드
            fileList    :  url + "list/teachingmeterial/",            // 파일 리스트  => classId
            fileDown    :  url + "file/download/",                    // 파일 다운 => :fileName
            fileDel     :  url + "delete/teachmeterial/",             // 파일 삭제 => :fileId
            qnaPlus     :  url + "file/uploadquestion/",              // 학생 질문 추가 => :fileId
            qnaList     :  url + "list/question/",                    // 과목 질문 리스트 => :classId
            qnaDelOne   :  url + "delete/myquestion/",                // 과목 질문 개별 삭제 => :fileId
            qnaDel      :  url + "delete/allquestion/",               // 과목 질문 전체 삭제 => :classId
            qnaOk       :  url + "main/readquestion/",                // 과목 질문 읽음 표시 => :questionId
            stdSubIn    :  url + "main/request/",                     // 학생 그룹 참가 => :userId/:classId
            videoList   :  url + "list/video/",                       // 영상 리스트 => :classId
            videoTitle  :  url + "file/setsubtitle/",                 // 영상 소제목 변경 => :fileId
            stdClass    :  url + "file/get/",                         // 학생쪽 수업 시작 => :classId
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
        await axios.post(url , {data} ).then((res)=>{
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


    componentDidMount(){
        console.log(this.state);
    }

    componentDidUpdate(prevProps, prevState){

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
                            <Link to="/">
                                <button className="Home_Logo_Btn_Logout" onClick={() => {localStorage.clear()}}> 로그아웃 </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="Home_Content_Body">
                    
                    <Subject userData={this.state.userData} serverUrl={this.serverUrl} data={this.props.data} getData={this.props.getData}/>
                </div>
            </div>
        )   
    }
}
