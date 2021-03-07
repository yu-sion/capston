import React from "react";
import axios from "axios";
import "../css/Subject.css";
import Option from "./Option";

export default class Subject extends React.Component{
    constructor(props){
        super(props);
        this.urlObj = props.serverUrl;
        const userData = props.userData;
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
        const url = this.urlObj.getSubject + this.state.userData.id;
        await axios.post(url).then( res => {
            this.setState( !args ? 
                { subjectDatas : res.data.result } : 
                { subjectDatas : res.data.result,
                    option : null});
        }).catch( err => console.error(err));
    }

    //수업 시작
    start = () => {
        window.open("localhost:3000/teacherclass");
    }

//---------------------------------과목 목록 띄우는 함수
    prtSubjectList = () => {
        const lists =  this.state.subjectDatas != null ? this.state.subjectDatas.map( list => {
            const color = list.classOnline ? "yellow" : "rgba(204,204,204,0.8)";

            const view = (this.state.clickSubject === list.id && this.state.userData.userType === "professor") ? (
                <>
                <button onClick={() => { this.fileInfo(list.id)}} > 자료실 </button>
                <button onClick={this.start}> 수업 시작 </button> 
                <button onClick={() => { this.qnaInfo(list.id)}} > 질문 </button>
                </>
            )
            : (this.state.clickSubject === list.id && this.state.classOnline) ? (
                <>
                    <button onClick={() => { this.fileInfo(list.id)}} > 자료실 </button>
                    <button > 수업 참가 </button> 
                </>
            ) : (this.state.clickSubject === list.id) ? (
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
                    <input type="checkbox" onClick={()=> this.Home_Content_view_controller(list.id)}></input>
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
    Home_Content_view_controller = (id) => {
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

    render(){
        return (
            <div>
            <div className="Home_Content_SubjectList_Body" id="subjectList_Body">
                <div className="Home_Content_Add">
                    <div style={{width:'100%', height:'100%'}}>
                        <button style={{marginTop:"3px",marginRight:"5px", float:"right", }} onClick={()=>{this.setState({option:"add"})}}> 과목추가 </button>
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
                />
            </div>
        </div>
        )
    }
}