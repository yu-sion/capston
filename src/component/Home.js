import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Subject from "./Subject";
import "../css/Home.css";

export default function Home(props){
    /*
        Data State 
    */
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('data_user'))); // UserData
    // const [subjectData, setSubjectData] = useState(null);       // 과목 데이터
    const [infoChange, setInfoChange] = useState(null);         // 정보 수정
    const [subjectUpdate, setSubjectUpdate] = useState(null);   // 과목 수정, 삭제 

    /*
        View State
    */
    const [subjectOption, setSubjectOption ] = useState(null);          // 우측 옵션 view
    const [subjectList_View, setSubjectList_view] = useState(null);     // SubjectList _ View
 
    const history = useHistory();

    // axios Response URL Valiable
    const serverUrl = {
        server      : "http://54.146.88.72:3000/",
        getSubject  : "http://54.146.88.72:3000/list/subject/",      // userId
        InfoChange  : "http://54.146.88.72:3000/main/modifyuser/",   // userId , data => name, mail, phone
        createsub   : "http://54.146.88.72:3000/main/createsub/",    // userId,  data => sub_name 
        StdPermit   : "http://54.146.88.72:3000/list/student/",      // 학생 가입 대기중인 List 가져오기 :classId
        fileUpload  : "http://54.146.88.72:3000/file/add/",          // :userId/:fileType/:subjectId/
    }

    //정보 수정 시 이팩트
    useEffect(() =>{
        console.log("usrData");
        localStorage.setItem('data_user', JSON.stringify(userData));
    }, [userData]);
    

    // 로그 아웃
   const logout = () => {
       localStorage.clear();
       history.push('');
   }

   // 정보수정 함수
   const infoChangeFunc = () => {
       setInfoChange(infoChange == null ? (
           <div className="Home_Logo_UserInfo_Change_Body">
               <div className="Home_Logo_UserInfo_Change_Logo"> 정보 수정 </div>
               <div className="Home_Logo_UserInfo_Change_Content"> 
                <input className="Home_Logo_UserInfo_Change_Input" id="name" type="text" name="name" defaultValue={userData.userName} /> <br/>
                <input className="Home_Logo_UserInfo_Change_Input" id="email" type="text" name="email" defaultValue={userData.userMail} /> <br/>
                <input className="Home_Logo_UserInfo_Change_Input" id="phone" type="text" name="phone" defaultValue={userData.userPhone} /> <br/>
               </div>
               <div>
                   <button onClick={userDataChange}> 수정하기 </button>
               </div>
           </div>
       ) : null)
    }

    // 유저 정보 수정
    const userDataChange = async () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const data = {
            name : name,
            mail : email,
            phone : phone,
        }
        const url = serverUrl.InfoChange + userData.id;
        await axios.post(url , {data} ).then((result)=>{
            setUserData({
                ...userData,
                userName : data.name,
                userMail : data.mail,
                userPhone : data.phone,
            });
        }).catch((err) => {
            console.error("정보수정 에러 " + err);
        });
        setInfoChange(null);
    }
    return (
        <div className="Home_Main">
            <div className="Home_Logo_Frame_Body"> 
                <div className="Home_Logo_Img"> 로고 </div>
                <div className="Home_Logo_UserInfo_Change_Frame"> 
                        {infoChange}
                </div>
                <div className="Home_Logo_UsrData">  
                    <div className="Home_Logo_User_Name"> {userData.userName}  </div>
                    <div className="Home_Logo_Btn">
                        <button className="Home_Logo_Btn_InfoChange" onClick={infoChangeFunc}> 정보수정 </button>
                        <button className="Home_Logo_Btn_Logout" onClick={logout}> 로그아웃 </button>
                    </div>
                </div>
            </div>
            <div zclassName="Home_Content_Body">
                    <Subject userData={userData} serverUrl={serverUrl} />            </div>
        </div>
    )
}