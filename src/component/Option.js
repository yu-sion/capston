import React,{ useState, useEffect } from "react";
import axios from "axios";

/*

    자료실, 질문, 학생 목록, 영상

*/


export default function Options(props) {
    const userData  = props.userData;                                 // user 정보
    const urlObj    = props.urlObj;                                   // url
    const setOptionState = props.setOptionState;                      // 오른쪽 옵션 상태 set
    const optionState = props.optionState;                            // 오른쪽 옵션 상태 get
    const clickSub = props.clickSub;                                  // 누른 과목 번호
    const [subDataLists, setSubDataLists] = useState(null);           // 유저 목록 저장 
    console.log(urlObj);
    // option 값 확인 후 맞는 함수 띄우기

    if(optionState == "userList"){
        console.log("userList");
        return <GroupUser_List
                    clickSub={clickSub}
                    setSubDataLists={setSubDataLists}
                    subDataLists={subDataLists}
                    />
    }else if(optionState == "add"){
        return <GroupAdd_View 
                    userData={userData} 
                    urlObj={urlObj} 
                    setOptionState={setOptionState}
                    setSubDataLists={setSubDataLists}
                    subDataLists={subDataLists}
                    />
    }else if(optionState == "file"){
        return <p> file </p>
    }else if(optionState == "qna") {
        return <p>질문</p>
    }else{
        return <></>
    }
}

//---------------------------------------------------------------- 과목 추가------------------------------------------------------------------
    // 과목 추가 함수
async function Add({userData, urlObj, setOptionState}) {
    const element = document.getElementById('subjectName');
    const url = urlObj.createsub + userData.id;
    await axios.post(url, {data : { subName : element.value }})
    .then((res) => {
    // 리랜더 시킬 수 있는 스테이트 넣기
    })
    setOptionState(null);
}

// 과목 추가 부분 옵션
function GroupAdd_View({userData, urlObj, setOptionState}) {
    return (
        <div className="Home_Content_Option_Frame"> 
            <div> <h3> 그룹명 </h3> </div>
            <div className="Home_Content_GroupAdd_Main"> 
                <p> 그룹명을 추가해 주세요. </p> <br/>
                <input className="Home_Content_GroupAdd_Input" id="subjectName" name="subjectName"/>
                <button className="Home_Content_GroupAdd_Btn" onClick={(e) => Add({userData, urlObj, setOptionState})}> 과목추가 </button>
            </div>
        </div>
    )
}

//---------------------------------------------------------------- 해당 과목 유저 목록------------------------------------------------------------
// 해당 과목 유저 데이터 들고오기
async function GroupUser_List(clickSub, setSubDataLists, subDataLists) {
    console.log("Group");
    await axios.post(`http://54.146.88.72:3000/list/student/${clickSub}`)
    .then((res) => {
        console.log(res);
        // 학생 목록 저장 스테이트 추가
        setUserLists(res.data.result, clickSub, subDataLists);
    })
    return <></>;
}

// 해당 과목 유저 데이터 띄우기
const setUserLists = ({ data, clickSub, subDataLists}) => {
    console.log("map_str");
    const Lists = data || subDataLists;
    const list = typeof Lists == "object" ? Lists.map( item => {
        console.log(item);

        return (
        <tr style={{
            border : "black solid 3px",
        }}> {item.userName} </tr>
        )}) : null;
        return (
        <table>
            <tbody>
                {list}
            </tbody>
        </table>
    )
}
