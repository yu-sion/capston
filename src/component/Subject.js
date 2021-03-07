/* eslint-disable react/jsx-no-undef */
import React from "react";
import axios from "axios";
import "../css/Subject.css";
import Option from "./Option";
import { Link } from "react-router-dom";

export default class Subject extends React.Component{
    constructor(props){
        super(props);
        this.urlObj = props.serverUrl;
        const userData = props.userData;
        this.props.data({
            ...this.props.getData,
            userId : userData.id,
        })
        this.state = {
            userData : userData,
            subjectDatas : null,
            subjectData : null,
            option : null,
            clickSubject : null,
        }

    }
//-------------------------------- 과목 목록 가져오는 통신 
    getSubject = async (args) => {
        console.log("misdfnsdf");
        const url = this.urlObj.getSubject + this.state.userData.id;
        await axios.post(url).then( res => {
            console.log(res);
            this.setState( !args ? 
                { subjectDatas : res.data.result } : 
                { subjectDatas : res.data.result,
                    option : null});
        }).catch( err => console.error(err));
    }

    //수업 시작
    teacherStart = async (className, id) => {
        const classStartUrl = this.urlObj.typeId + this.state.userData.id + "/" + 3 + "/" + id;

        await axios.post(classStartUrl, {data : {fileName : className}})
        .then((res) => {
            this.props.data({
                className : className,
                videoId : res.data.fileId,
                classId : this.props.clickSub,
                stdId : this.state.userData.id,
            });
        })
        
    }

    studentStart = async () => {
        // const classStartUrl = this.urlObj.typeId + this.state.userData.id + "/" + 3 + "/" + id;

        // await axios.post(classStartUrl, {data : {fileName : className}})
        // .then((res) => {
        //     this.props.data({
        //         className : className,
        //         videoId : res.data.fileId,
        //         classId : this.props.clickSub,
        //         stdId : this.state.userData.id,
        //     });
        // })
    }

//---------------------------------과목 목록 띄우는 함수
    prtSubjectList = () => {
        const lists =  this.state.subjectDatas != null ? this.state.subjectDatas.map( list => {
            const color = list.classOnline ? "yellow" : "rgba(204,204,204,0.8)";

            const view = (this.state.clickSubject === list.id && this.state.userData.userType === "professor") ? (
                // 교수 과목
                <>
                    <button onClick={() => { this.typeInfo("file", list.id)}} > 자료실 </button>
                    <Link to="/teacherclass">
                        <button onClick={() => { this.teacherStart(list.className, list.id)}}> 수업 시작 </button> 
                    </Link>
                    <button onClick={() => { this.typeInfo("qna", list.id)}} > 질문 </button>
                    <button onClick={() => { this.typeInfo("video", list.id)}}> 영상보기 </button> 
                </>
            )
            : (this.state.clickSubject === list.id && this.state.classOnline) ? (
                // 학생 과목 온라인시
                <>
                    <button onClick={() => { this.typeInfo("file", list.id)}} > 자료실 </button>
                    <Link to="/studentclass">
                        <button onClick={() => {this.studentStart()}}> 수업 참가 </button>
                    </Link> 
                </>
            ) : (this.state.clickSubject === list.id) ? (
                // 학생 과목 오프라인
                <>
                    <button onClick={() => { this.typeInfo("file",list.id)}} > 자료실 </button>
                    <button onClick={() => { this.typeInfo("video", list.id)}}> 영상보기 </button> 
                    <button onClick={() => { this.typeInfo("qna", list.id)}} > 질문 </button>
                </>
            ) : null;
            return (
                <div className="Sub_Lists" style={{
                    backgroundColor : color,
                    border : "black solid 3px",
                }}>
                    <input type="checkbox" onClick={(e)=> this.Home_Content_view_controller(list.id, list.className, e)}></input>
                    {list.className} 
                    {view}
                </div>
            )
        }) : null;

        return (
            <div>
                {lists}
            </div>
        )
    }
    
    //-----------------------------------------------------------영상, 질문, 자료실-------------------------------------------------------------
    typeInfo = (type, id) => {
        this.setState({
            option : type,
            clickSub : id,
        })
    }

    //----------------------------------------------------------오른 쪽 뷰 제어 함수---------------------------------
    Home_Content_view_controller = (id, name, e) => {
        const check = e.target.checked;
        const infoBtn = document.getElementById("infoBtn");
        const delBtn = document.getElementById("delBtn");
        if(check && this.state.userData.userType !== "student") {
            infoBtn.style.display = "block";
            delBtn.style.display = "none";
        }else{
            delBtn.style.display = "block";
            infoBtn.style.display = "none";
        }
        this.props.data({
            ...this.props.getData,
            classId : id,
            className : name,
        })
        if(this.state.option !== "prtStd") {
            this.setState({clickSubject : id , option : "stdList"})
        }else{
            this.setState({option : "null"})
        }

    }

    componentDidMount(){
        this.getSubject();
    }


    componentDidUpdate(prevProps, prevState){
        if(this.state.subjectDatas !== prevState.subjectDatas){
            console.log(this.state.subjectDatas);
        }
        if(this.state.clickSubject !== prevState.clickSubject){
            console.log(this.state.clickSubject);
        }
    }

    setOptionState = (arg) => {
        this.setState({
            option : arg
        })
    }

    //--------------과목 삭제
    delSub = async () => {
        const delSubUrl = this.urlObj.delSub + this.state.clickSubject;
        console.log(delSubUrl);
        await axios.post(delSubUrl)
        .then((res) => {
            console.log(res);
            this.getSubject();
        })
    }


    render(){
        return (
            <div>
            <div className="Home_Content_SubjectList_Body" id="subjectList_Body">
                <div className="Home_Content_Add">
                    <div style={{width:'100%', height:'100%'}}>
                        <div id="delBtn" style={{ display : "block"}}>
                            <button style={{marginTop:"3px",marginRight:"5px", float:"right", }} onClick={()=>{this.setState({option:"add"})}}> 과목추가 </button>
                        </div>
                        <div id="infoBtn" style={{ display : "none" }}>
                            <button style={{marginTop:"3px",marginRight:"5px", float:"right", }} onClick={() => {this.setOptionState("infoSub")}}> 과목수정 </button>
                            <button style={{marginTop:"3px",marginRight:"5px", float:"right", }} onClick={this.delSub} > 과목삭제 </button>
                        </div>
                    </div>
                    <div className="Home_Content_Subject_View">
                        <this.prtSubjectList />
                    </div>
                </div>
            </div>
            <div className="Home_Content_SubList_View_Body">
                <Option
                    userData ={this.state.userData} 
                    urlObj={this.urlObj} 
                    subjectData={this.state.subjectData} 
                    optionState={this.state.option} 
                    clickSub={this.state.clickSubject}
                    getSubject={this.getSubject}
                    setOptionState={this.setOptionState}
                    data={this.props.data}
                />
            </div>
        </div>
        )
    }
}