import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "../css/Home.css";

export default function Home(props){
    /*
        Data State 
    */
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('data_user'))); // UserData
    const [subjectData, setSubjectData] = useState(null);       // 과목 데이터
    const [infoChange, setInfoChange] = useState(null);         // 정보 수정
    const [subjectUpdate, setSubjectUpdate] = useState(null);   // 과목 수정, 삭제 
    const [fileData, setFileData] = useState(null);             // 자료실
    const [questionData, setQuestionData] = useState(null);     // 질문
    const [optionState, setOptionState] = useState(null);       // 옵션
    const [clickEvent, setClickEvent] = useState({              
        subjectClick : null,
        subjectGroupAddClick : null,
    });
    //참가 희망 학생 받기 // 리스트 쪽 엑시오스 수정하고
    const waitStd = [
        {StdId : 1, StdName : "test1", state : "wait"},
        {StdId : 2, StdName : "test2", state : "wait"},
        {StdId : 3, StdName : "name", state : "Inner"},
        {StdId : 4, StdName : "baba", state : "wait"},
        {StdId : 5, StdName : "bobo", state : "wait"},
        {StdId : 6, StdName : "sion", state : "Inner"},
        {StdId : 7, StdName : "SinZuKu", state : "wait"},
    ]

    //자료실 데이터
    const exFileList = [
        {date : "2020.3.1", name : "Java_1"},
        {date : "2020.3.6", name : "Java_2"},
        {date : "2020.3.10", name : "Java_3"},
    ]
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
        StdPermit   : "http://54.146.88.72:3000/",                    // 학생 가입 대기중인 List 가져오기
        fileUpload  : "http://54.146.88.72:3000/file/add/",          // :userId/:fileType/:subjectId/
    }

    useEffect(async ()=>{
        // component Did Mount
        await getSubjectList();
        setSubjectUpdate((
            <div style={{width:'100%', height:'100%'}}>
                <button style={{marginTop:"3px",marginRight:"5px", float:"right",}} onClick={()=>{GroupAdd_View()}}> 과목추가 </button>
            </div>
        ))
    },[]);
    useEffect(() =>{
        localStorage.setItem('data_user', JSON.stringify(userData));
    }, [userData]);
    
    useEffect(()=>{
        if(subjectData != null){
            SubjectData_View();
        }
    }, [subjectData]);
    useEffect(()=>{
        const element = document.getElementById('subjectList_Body');
        if(subjectOption == null){
            element.style.display = "block";
            element.style.margin = "0px auto";
        }else{
            element.style.display = "inline-block";
            element.style.margin = "0px 0px";
            element.style.marginLeft = "20px";
        }
        if(subjectData != null){
            SubjectData_View();
        }
    }, [subjectOption]);
    useEffect(()=>{
        
    },[subjectList_View]);
    /* 공통부분
            정보수정, 과목 목록
        학생
            그룹추가 ( RD )( classId 입력 ), 질문 CRUD, 영상보기, 자료실 다운로드
        교수
            그룹 생성 ( 과목명 입력 ), 질문 확인, 자료실 CRUD, 과목 CRUD
    */

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

    // ---------------------------  Data Function ---------------------------------
        // getSubject List to User
    const getSubjectList = async () => {
        const url = serverUrl.getSubject + userData.id;
        await axios.post(url).then((req)=>{
            setSubjectData(req.data.result);
        });
    }

    //  학생 승인 List 저장
    const getStdPermit = async (key, className) => {
        // const url = serverUrl.StdPermit;
        // await axios.post(url, {})
        // .then(res => {

        // }).catch(err => {console.error(err)});
        setClickEvent({
            ...clickEvent,
            subjectClick : key,   
        })
        console.log('getStdPermit');
        if(userData.userType == "teacher" && ( optionState != 1 || key != clickEvent.subjectClick)){
            setSubjectOption(StdPermit(className, key));
            setOptionState(1);
        }
    }

    const getFileData = async () => {
        if(userData.userType == "teacher"){
            const url = serverUrl.fileData;
            fileData_View();
            // await axios.post(url).then(res => {

            // }).catch(err => console.error(err));
        }else{

        }
    }

    // ---------------------------  View Function ---------------------------------
    const question_View = () => {
        const question = [
            {userId : 1, title : "test1", content : "Hello", userNum : 111, userName : "Bob", state : true},
            {userId : 2, title : "test2", content : "MeMos", userNum : 121, userName : "Com", state : false},
            {userId : 3, title : "test3", content : "Come In", userNum : 131, userName : "Tom", state : true},
            {userId : 4, title : "test4", content : "World", userNum : 151, userName : "Can", state : false},
            {userId : 5, title : "test5", content : "PHAH", userNum : 171, userName : "Kois", state : true},
            {userId : 6, title : "test6", content : "JavaCode", userNum : 191, userName : "Los", state : true},

        ];
        const lists = question.map( list => {
            const queClickEvent = (argId) =>{
                document.getElementById(argId)
            }
            const color = list.state ? "rgba(53,108, 213) solid 2px" : "2px solid gray";
            return (
                <div className="Home_Option_Content_Question_List"
                style={{border : color,}}>
                    <div className="Home_Option_Content_Question_title"
                    style={{borderBottom:color,}}
                    onClick={()=>{}}> 
                        {list.title}  {list.userNum} {list.userName}
                    </div>
                    <div className="Home_Option_Content_Question_Body"
                    style={{display:"none"}}
                    >
                        {list.content}
                    </div>
                </div>
            )
        });
        setSubjectOption((
            <div className="Home_Content_Option_Frame">
                {lists}
            </div>
        ))
    }

    const fileData_View = () => {
        const lists = exFileList.map((list) => {
            if(userData.userType == "teacher"){
                return (
                    <div className="Home_Content_SubList_Option_View_Body_FileData"
                    style={{
                        width:"90%",
                        margin:"0 auto",
                        marginTop : "10px",
                        border : "rgba(53,108, 213) solid 2px",
                    }}>
                        {list.name}
                        <div style={{float:'right', display:"block"}}>
                            <button> 다운 </button>
                            <button> 삭제 </button>
                        </div>
                        <div style={{float:'right', display:"block"}}></div>
                    </div>
                )}else{
                    return (
                        <>
                        </>
                )}
        });
        setOptionState(2);
        setSubjectOption((
            <div className="Home_Content_Option_Frame">
                <div> 자료실 </div>
                {lists}
                <div> <button> 업로드 </button> </div>
            </div>
        ))
    }
    const GroupAdd_axios = async () => {
        const element = document.getElementById('subjectName');
        console.log(element.value);
        const url = serverUrl.createsub + userData.id;

        await axios.post(url, {data : { subName : element.value }})
        .then((res) => {
            //과목 추가 응답 왔을 시
            //리랜더 시킬 수 있는 스테이트 넣기
            console.log(res);
            console.log(subjectData)
            getSubjectList()
            // setSubjectData(res.data);
            //이러면 subjectData.map is not a function 이렇게 뜸
            
        })
        setSubjectOption(null);
    }

    const GroupAdd_View = () => {
        /*
            과목 추가 View
        */
       setSubjectOption ((
            <div className="Home_Content_Option_Frame">
                <div> <h3> 그룹명 </h3> </div>
                <div className="Home_Content_GroupAdd_Main">
                    <p> 그룹명을 추가해 주세요. </p> <br/>
                    <input className="Home_Content_GroupAdd_Input" id="subjectName" name="subjectName"/>
                    <button className="Home_Content_GroupAdd_Btn" onClick={GroupAdd_axios} > 과목추가 </button>
                </div>
            </div>
        ));
    }

    const StdPermit = (subject, key) => {
        const lists_1 = waitStd.map(list => {
            if(list.state == "wait"){
                return (
                    <div className="Home_Content_Option_StdList_Permit"> 
                        {list.StdName}  
                        <button className="Home_Content_Option_StdList_Permit_Btn"> O </button>
                        <button className="Home_Content_Option_StdList_Permit_Btn"> X </button>
                    </div>
                )
            }
        });
        const lists_2 = waitStd.map( list => {
            if(list.state == "Inner"){
                return (
                    <div className="Home_Content_Option_StdList_Permit"> 
                        {list.StdName} {list.StdId}  
                        <button> 정보보기 </button>
                    </div>
                )
            }
        });

        return (
            <div className="Home_Content_Option_Frame">
                <div> 신규신청 </div>
                {lists_1}
                <div> 현재인원 </div>
                {lists_2}
                
            </div>
        )
    }
    // SubjectList Data => prt View
    const SubjectData_View = () => {
        /*
            id, className, classRanNum, classSemester, classOnline
        */
        const lists = subjectData.map( list => {
            const color = !list.classOnline ? "rgba(204,204,204,0.8)" : "white";
            /* 
                과목별 버튼 List
                교수 : 자료실, 질문 수업시작
                학생 : 
                    => 수업중 : 수업참가
                    => 수업중X : 자료실, 녹화보기, 질문
            */
            const view = userData.userType == "teacher" ? 
                <div className="Home_Content_SubjectList_Btn_Body"> 
                    <button className="Home_Content_SubjectList_Btn" > 수업시작 </button>
                    <button className="Home_Content_SubjectList_Btn" onClick={question_View}> 질문 </button>
                    <button className="Home_Content_SubjectList_Btn" onClick={getFileData}> 자료실 </button>
                </div> : list.classOnline ? 
                <div className="Home_Content_SubjectList_Btn_Body">
                    <button className="Home_Content_SubjectList_Btn"> 수업참가 </button>
                </div> : 
                <div className="Home_Content_SubjectList_Btn_Body">
                    <button className="Home_Content_SubjectList_Btn" onClick={getFileData}> 자료실 </button>
                    <button className="Home_Content_SubjectList_Btn"> 녹화보기 </button>
                    <button className="Home_Content_SubjectList_Btn"> 질문 </button>
                </div>;
            // Btn Click시 btn view 표시
            const btn_View = clickEvent.subjectClick == list.id ?  view : null;
            return (
                <div className="Home_Content_SubjectList_Data_Body"
                style={{
                    height : "20px",
                    backgroundColor : color,
                    border : "2px solid black",
                    marginBottom : "5px",
                }}>
                    <div className="Home_Content_SubjectList_Data" onClick={()=>{getStdPermit(list.id, list.className)}}>
                        {list.className}
                        {btn_View}
                    </div>
                </div>
            )
        });
        setSubjectList_view((
            <div className="Home_Content_SubjectList_Data_Frame">
                {lists}
            </div>
        ));
    }

    //  render 
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
            <div className="Home_Content_Body">
                <div className="Home_Content_SubjectList_Body" id="subjectList_Body">
                    <div className="Home_Content_Add">
                        {subjectUpdate}
                    </div>
                    <div className="Home_Content_Subject_View">
                        {subjectList_View}
                    </div>
                </div>
                <div className="Home_Content_SubList_View_Body">
                    {subjectOption}
                </div>
            </div>
        </div>
    )
}