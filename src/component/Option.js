import React from "react";
import axios from "axios";
import { saveAs } from 'file-saver';
/*

    자료실, 질문, 학생 목록, 영상

*/

export default class Option extends React.Component{
    constructor(props){
        super(props);

        const usrData = props.userData;
        const subjectData = props.subjectData;
        this.urlObj = props.urlObj;
        this.clickSub = props.clickSub;
        this.setOptionState = props.setOptionState;

        this.state = {
            userData : usrData,   
            subject : subjectData,
            stdList : null,         // 과목 리스트
            userInfo : null,        // 정보 수정
            fileList : null,        // fileList Datas
            selectFile : null,
            qnaList  : null,
        }
    }

    //---------------------------------------------------누른 과목의 정보 통신( 학생 리스트 )-------------------------------------------
    subjectStdList = async () => {
        console.log("hello");
        const url = this.urlObj.StdPermit + this.props.clickSub;
        await axios.post(url).then( res => {
            console.log(res);
            this.setState({
                stdList : res.data.result
            })
        }).catch(err => console.error(err));
    }

    //----------------------------------------------------------과목 추가 통신----------------------------------------------------------
    subjectAdd = async () => {
        const url = this.urlObj.createsub + this.state.userData.id;
        const element = document.getElementById('subjectName');
        const data = {subName : element.value}
        await axios.post(url, {data}).then( req => {
            this.props.getSubject(1);
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.stdList !== prevState.stdList){
            console.log(this.state.stdList);
            this.setOptionState("prtStd");
        }
        if(this.state.fileList !== prevState.fileList){
            this.setOptionState("fileView");
        }
        if(this.state.qnaList !== prevState.qnaList){
            this.setOptionState("qnaView");
        }
        console.log(this.state.fileList);
        
    }

//----------------------------------------가입 된 학생의 정보 띄우기--------------------------------------------
    StdInfo = (index) => {
        if(this.state.userInfo == null) {
        this.setState({
            userInfo : (
            <div>
                <div>이름 : {this.state.stdList[index].userName}</div>
                <div>학번 : {this.state.stdList[index].userNum}</div>
                <div>번호 : {this.state.stdList[index].userPhone}</div>
                <div>메일 : {this.state.stdList[index].userMail}</div>
            </div>
            )
        })}
        else {
            this.setState({
                userInfo : null,
            })
        }
    }

//-------------------------------------------- 학생 승인 / 거절 ------------------------------------------------------
    homeContentUserOk = async (org, orgClass, userId) => {
        // userId/:classId/:accept  => 1 수락 / 2 거절
        const url = this.urlObj.userAccept + userId + "/" + orgClass + "/" + org;
        await axios.post(url).then( res => {
            console.log(res);
            // 리랜더 시키기
            this.subjectStdList();
        }).catch(err => console.error(err));
    }

//---------------------------------------subjectStdList에서 받아온 정보 map으로 띄우기---------------------------------------
    prtSubjectStdList = () => {
        console.log(this.state.stdList);
        //----------------------------------------------그룹 : 가입 대기 중 학생 목록
        const lists1 = this.state.stdList != null ? this.state.stdList.map( list => {
                if(list.includeClass != 1){
                return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> {list.userName} 
                    <button onClick={() => {this.homeContentUserOk(1, this.props.clickSub, list.id)}}>O</button>
                    <button onClick={() => {this.homeContentUserOk(2, this.props.clickSub, list.id)}}>X</button>
                    </div>
                )
            }
        }) : null;

        //---------------------------------------------------그룹 : 가입된 학생 목록
        const lists2 = this.state.stdList != null ? this.state.stdList.map( (list, index) => {
            if(list.includeClass == 1) {
                return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }} onClick={()=> {this.StdInfo(index)}}> {list.userName}</div>
                )
            }
        }) : null;
        return (
            <div className="Home_Content_Option_Frame" style={{margin : "10px"}}> 
                <div>
                    <h3>과목 번호</h3>
                    <p> 가입 대기 중 목록 </p>
                    {lists1}
                </div>
                <div>
                    <p> 가입 된 목록 </p>
                    {lists2}
                </div>
            </div>
        )
    }

    //----------------------------------------------------------파일 업로드 함수--------------------------------------------------------
    fileUpload = async(fileType, classNum, userId) => {
        const fileIdUrl = this.urlObj.fileId + userId + "/" + fileType + "/" + classNum;
        const data = new FormData();
        const file = document.getElementsByClassName("file");
        data.append("file", file[0].files[0], file[0].files[0].name);
        console.log(file[0].files[0].name);

        const req = new XMLHttpRequest();

        await axios.post(fileIdUrl, {data : {fileName : file[0].files[0].name }})
        .then((res) =>{
            console.log(res);
            const fileUploadUrl = this.urlObj.fileUpload + res.data.fileId;
            console.log(fileUploadUrl);
            req.open('POST', fileUploadUrl, false);
            req.send(data);
            console.log("OK_OK_OK");
            this.getFileList();
        })        
    }

    //----------------------------------------------------------파일 다운 함수-------------------------------------------------
    fileDown = (name) => {
        const fileDownUrl =this.urlObj.fileDown + name;
        console.log(fileDownUrl);
        window.open(fileDownUrl);
    }

    //---------------------------------------------------------파일 삭제 함수--------------------------------------------------
    fileDel = (id) =>{
        const fileDel = this.urlObj.fileDel + id;
        axios.post(fileDel)
        .then((res) => {
            console.log(res);
            this.getFileList()
        })
    }

    //----------------------------------------------------------자료실 view-----------------------------------------------------
    fileView = () => {
        console.log(this.state.fileList);
        console.log(this.props);

            return ( 
                <div className="Home_Content_Option_Frame"> 
                    <div> <h3> 자료실 </h3> </div>
                    <div className="Home_Content_GroupAdd_Main"  > 
                        <input type="file" multiple className="file"/>
                        <table>
                            <tbody>
                                <this.fileListViewMap />
                            </tbody>
                        </table>
                        <button className="Home_Content_GroupAdd_Btn"
                            onClick = {() => {this.fileUpload(1, this.props.clickSub, this.state.userData.id)}}> 업로드 </button>
                    </div>
                </div>
            )
    }

    //----------------------------------------------------------파일 목록 함수------------------------------------------------------------
    getFileList = async () => {
        console.log("getFileList");
        const fileListUrl = this.urlObj.fileList + this.props.clickSub;
        await axios.post(fileListUrl)
        .then((res) => {
            console.log(res.data.result);
            this.setState({
                fileList : res.data.result
            });
            console.log(this.state.fileList); // null
        })
        
    }
    
    //------------------------------------------------------fileListView => map --------------------------------------------------------
    fileListViewMap = () =>{
        const lists = this.state.fileList != null ? this.state.fileList.map( ( list ) => {
                return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div>
                            {list.fileName}
                        <button style={{marginLeft:"5px", float : "right",}} onClick={() => {this.fileDel(list.id)}}>삭제</button>
                        <button style={{marginLeft:"5px", float : "right",}} onClick={() => {this.fileDown(list.fileName)}}>다운</button>
                        </div>
                    </div>
                )
        }) : null;
        return (
            <div style={{margin : "10px"}}> 
                <div>
                    {lists}
                </div>
            </div>
        )
    }

    //----------------------------------------------------------그룹 추가 view----------------------------------------------------------
    prtGroup_Add = () => {
        // userData, urlObj, setOptionState
        return (
            <div className="Home_Content_Option_Frame"> 
                <div> <h3> 그룹명 </h3> </div>
                <div className="Home_Content_GroupAdd_Main"> 
                    <p> 그룹명을 추가해 주세요. </p> <br/>
                    <input className="Home_Content_GroupAdd_Input" id="subjectName" name="subjectName"/>
                    <button className="Home_Content_GroupAdd_Btn" onClick={this.subjectAdd}> 과목추가 </button>
                </div>
            </div>
        )
    }

    //-------------------------------------------------------과목 질문 전체 삭제--------------------------------------------------------
    qnaDel = async(id) => {
        const qnaDelUrl = this.urlObj.qnaDel + id;
        await axios.post(qnaDelUrl)
        .then((res) => {
            console.log(res);
            this.qnaListAxios();
        })
    }
    //-------------------------------------------------------과목 질문 리스트 axios-----------------------------------------------------
    qnaListAxios = async () => {
        console.log("hello");
        const qnaUrl = this.urlObj.qnaList + this.props.clickSub;
        await axios.post(qnaUrl).then( res => {
            console.log(res);
            this.setState({
                qnaList : res.data.result
            })
        }).catch(err => console.error(err));
    }
    
    //------------------------------------------------------과목 질문 View-------------------------------------------------
    qnaView = () => {
        console.log(this.state.qnaList);
        console.log(this.props);

            return ( 
                <div className="Home_Content_Option_Frame"> 
                    <div> 
                        <h3> 질문 </h3>
                    </div>
                    <div className="Home_Content_GroupAdd_Main"  > 
                        <table>
                            <tbody>
                                <this.qnaListViewMap />
                            </tbody>
                        </table>
                        <button onClick={() => {this.qnaDel(this.props.clickSub)}}>삭제</button>
                    </div>
                </div>
            )
    }

    //----------------------------------------------------과목 질문 리스트 map----------------------------------------------------------
    qnaListViewMap = () =>{
        const lists = this.state.qnaList != null ? this.state.qnaList.map( ( list ) => {
            const color = ( list.check === 1 ) ? "gray" : "red"; 
                return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div style={{color : color}} onClick={() => this.qnaOk(list.id)}>
                            {list.fileName}
                        </div>
                        <div style={{display:'none'}}>
                            {list.content}
                        </div>
                    </div>
                )
        }) : null;
        return (
            <div style={{margin : "10px"}}> 
                <div>
                    {lists}
                </div>
            </div>
        )
    }

    //------------------------------------------------질문 읽음 표시------------------------------------------
    qnaOk = (id) =>{
        const qnaOkUrl = this.urlObj.qnaOk + id;
        axios.post(qnaOkUrl)
        .then((res) =>{
            console.log(res);
            this.qnaListAxios();
        })
    }
    render(){
        // 과목 추가
        if(this.props.optionState === "add"){
            return this.prtGroup_Add();
        }
        // 과목 리스트
        if(this.props.optionState === "stdList"){
            this.subjectStdList();
        }
        // 선택 과목 학생 리스트
        if(this.props.optionState === "prtStd"){
            return (
            <div>
                <this.prtSubjectStdList />
                {this.state.userInfo}
            </div>
            )
        }
        // 선택 과목 자료실 get
        if(this.props.optionState === "file"){
            this.getFileList();
            return (<div></div>);
        }
        // 선택 과목 자료실 띄우기
        if(this.props.optionState === "fileView"){
            return this.fileView();
        }
        if(this.props.optionState === "qna"){
            this.qnaListAxios();
            return (<div></div>)
        }
        if(this.props.optionState === "qnaView"){
            return this.qnaView();
        }
        return (<>
        </>
        )
    }
}