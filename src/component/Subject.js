import React,{ useEffect, useState } from "react";
import axios from "axios";
import "../css/Subject.css";
import Options from "./Option";


export default function Subject(props) {
    const userData  = props.userData;
    const urlObj    = props.serverUrl; 
    const [subjectData, setSubjectData] = useState(null);       // 과목 데이터
    const [viewSta, setViewSta] = useState(null);
    const [optionState, setOptionState] = useState(null);       // 옵션
    const [clickSub, setClickSub] = useState(null);             // 클릭 된 과목 기억

    // 처음 한 번
    useEffect(async ()=>{
        console.log("didmount");
        await getSubLists();
    },[])

    // 뷰가 바뀔 때
    useEffect(() =>{   
        console.log("viewSta");
    },[viewSta])

    // useEffect(async () =>{
    //     console.log("option");
    //     await getSubLists();
    // },[optionState])



    // 과목 아이디 및 상태값 변경
    const subId = (id) => {
        setClickSub(id)
        setOptionState("userList")
    }

    // 과목 목록들 저장
    const getSubLists = async () =>{
        const url = urlObj.getSubject + userData.id;
        let data = null;
        await axios.post(url)
        .then((res) => {
            setSubjectData(res.data.result);
            data = res.data.result;
        });
        setSubLists(data);
    }

    // 목록 띄우기
    const setSubLists = (argData) => {
        const Lists = argData || subjectData;
        const list = typeof Lists == "object" ? Lists.map( item => {
            const color = item.classOnline ? "yellow" : "rgba(204,204,204,0.8)";
            return (
            <tr className="Sub_Lists" style={{
                backgroundColor : color,
                border : "black solid 3px",
            }} onClick={(e) => subId(item.id)}>
                {item.className}
            </tr>
            )
        }) : null;
        setViewSta(
            <table className="Sub_table">
                <tbody>
                    {list}
                </tbody>
            </table>
        )
    }

    // 오른쪽 옵션 뷰 상태 값 변
    return (
        <div>
            <div className="Home_Content_SubjectList_Body" id="subjectList_Body">
                <div className="Home_Content_Add">
                    <div style={{width:'100%', height:'100%'}}>
                        <button style={{marginTop:"3px",marginRight:"5px", float:"right", }} onClick={() => setOptionState("add")}> 과목추가 </button>
                    </div>
                    <div className="Home_Content_Subject_View">
                        {viewSta}
                    </div>
                </div>
            </div>
            <div className="Home_Content_SubList_View_Body">
                <Options 
                    userData ={userData} 
                    urlObj={urlObj} 
                    subjectData={subjectData} 
                    optionState={optionState} 
                    setOptionState={setOptionState} 
                    clickSub={clickSub}
                />
            </div>
        </div>
    )
}