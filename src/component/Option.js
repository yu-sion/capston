import React from "react";
import axios from "axios";
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
            videoList : null,
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
        const element = document.getElementById('subjectName');
        const data = {subName : element.value};
        if(this.state.userData.userType === "student"){
            console.log(this.urlObj.stdSubIn + this.state.userData.id + "/" + element.value)
            await axios.post(this.urlObj.stdSubIn + this.state.userData.id + "/" + element.value)
            .then((res) =>{
                this.props.getSubject(1);
            })
        }else{
            await axios.post(this.urlObj.createsub + this.state.userData.id, {data})
            .then( req => {
            this.props.getSubject(1);
        });
        }
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
        if(this.state.videoList !== prevState.videoList){
            this.setOptionState("videoView");
        }
        
        
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
        const teacherView = (this.state.userData.userType === "professor") ? (
                <div>
                    <p> 가입 대기 중 목록 </p>
                    {lists1}
                </div>
        ) : null;
        return (
            <div className="Home_Content_Option_Frame" style={{margin : "10px"}}> 
                <div>
                    <h3>과목 번호 : {this.props.clickSub}</h3> 
                    {teacherView}
                </div>
                <div>
                    <p> 학생 목록 </p>
                    {lists2}
                </div>
            </div>
        )
    }

    //----------------------------------------------------------파일 업로드 함수--------------------------------------------------------
    fileUpload = async(fileType, classNum, userId) => {
        const fileIdUrl = this.urlObj.typeId + userId + "/" + fileType + "/" + classNum;
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
            const fileBtn = (this.state.userData.userType === "student" ) ? 
                            <div></div> : (
                                        <div>
                                        <input type="file" multiple className="file"/>
                                        <button className="Home_Content_GroupAdd_Btn"
                                            onClick = {() => {this.fileUpload(1, this.props.clickSub, this.state.userData.id)}}> 업로드 </button>
                            </div>
                            );
            return ( 
                <div className="Home_Content_Option_Frame"> 
                    <div> <h3> 자료실 </h3> </div>
                    <div className="Home_Content_GroupAdd_Main"  > 
                            {fileBtn}
                        <table>
                            <tbody>
                                <this.fileListViewMap />
                            </tbody>
                        </table>
                        
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
            console.log(this.state.userData.userType);
            var fDelBtn = (this.state.userData.userType === "professor") ? 
                        <button style={{marginLeft:"5px", float : "right",}} onClick={() => {this.fileDel(list.id)}}>삭제</button> : null;
                return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div>
                            {list.fileName}
                            {fDelBtn}
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
                    <p> 그룹명 또는 과목 번호를 추가해 주세요. </p> <br/>
                    <input className="Home_Content_GroupAdd_Input" id="subjectName" name="subjectName"/>
                    <button className="Home_Content_GroupAdd_Btn" onClick={this.subjectAdd}> 과목추가 </button>
                </div>
            </div>
        )
    }

    //-------------------------------------------------------과목 질문 전체 / 개별 삭제--------------------------------------------------------
    qnaDel = async(id) => {
        var qnaDelUrl = null;
        if(this.state.userData.userType === "student") {
            qnaDelUrl = this.urlObj.qnaDelOne + id;
            console.log(qnaDelUrl);
            console.log("end");
        }else {
            qnaDelUrl = this.urlObj.qnaDel + this.props.clickSub;
        }
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

    //------------------------------------------------------과목 질문 추가 axios(학생)------------------------------------------
    qnaUpload = async() => {
            const userId = this.state.userData.id;
            const qnaIdUrl = this.urlObj.typeId + userId+ "/" + 2 + "/" + this.props.clickSub;

            console.log(qnaIdUrl);
            const qnaPlusUrl = this.urlObj.qnaPlus;
            const fileTitle = "test";
            const fileContent = "2";
            
            const data = {
                questionTitle : fileTitle,
                questionContent : fileContent,
            }
            console.log(data);
            await axios.post(qnaIdUrl, {data : {fileName : fileTitle}})
            .then((res) => {
                console.log(res.data.fileId);
                this.setState({
                    fileId : res.data.fileId,
                })
                console.log(qnaPlusUrl+res.data.fileId);
                console.log(data);
                axios.post(qnaPlusUrl+res.data.fileId, {data})
                .then((res) => {
                    this.qnaListAxios();
                    console.log("end : ", res);
                }).catch((err) => {
                    console.log("err : ", err);
                })
            })
            
    }
    //------------------------------------------------------과목 질문 추가(학생)-------------------------------------------
    qnaPlus = () => {
        this.qnaUpload();
        console.log("title");
        return(
                <form>
                    <tr>
                        <td>질문명</td>
                        <td><input type="text" id="title" /></td>
                    </tr>
                    <tr>
                        <td>질문 내용</td>
                        <td><input type="text" id="content" /></td>
                    </tr>
                    <tr>
                        <td>
                            <button onClick={this.qnaUpload}>추가</button>
                        </td>
                        
                    </tr>
                </form>
        )

    }
    
    //------------------------------------------------------과목 질문 View-------------------------------------------------
    qnaView = () => {
        console.log(this.state.qnaList);
        console.log(this.props);
        const type = (this.state.userData.userType === "student") ? <button onClick={this.qnaPlus}>질문하기</button> : <button onClick={() => {this.qnaDel()}}>삭제</button>;
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
                        {type}
                    </div>
                </div>
            )
    }

    //----------------------------------------------------과목 질문 리스트 map----------------------------------------------------------
    qnaListViewMap = () =>{
        const lists1 = this.state.qnaList != null ? this.state.qnaList.map( ( list ) => {
            const type = (this.state.userData.userType !== "student") ? null : <button onClick={() => {this.qnaDel(list.id)}}>삭제</button>;
            const color = ( list.check === 1 ) ? "gray" : "red"; 
            if(list.check === 0) {
            return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div style={{color : color, width : "300px",}} onClick={() => this.qnaOk(list.id)}>
                            {list.fileName}
                            <div style={{float : "right"}}>{type}</div>
                        </div>
                        <div style={{display:'none'}}>
                            {list.content}
                        </div>
                    </div>
                )
        }}) : null;
        const lists2 = this.state.qnaList != null ? this.state.qnaList.map( ( list ) => {
            const type = (this.state.userData.userType !== "student") ? null : <button onClick={() => {this.qnaDel(list.id)}}>삭제</button>;
            const color = ( list.check === 1 ) ? "gray" : "red"; 
            if(list.check === 1) {
            return (
                    <div style={{
                        border : "black solid 1px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div style={{color : color, width : "300px",}} onClick={() => this.qnaOk(list.id)}>
                            {list.fileName}
                            <div style={{float : "right"}}>{type}</div>
                        </div>
                        <div style={{display:'none'}}>
                            {list.content}
                        </div>
                    </div>
                )
        }}) : null;
        return (
            <div style={{margin : "10px"}}> 
                <div>
                    <h3>질문</h3>
                    {lists1}
                </div>
                <div>
                    <h3>읽은 질문</h3>
                    {lists2}
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

    //-------------------------------------------------------비디오 리스트 axios-----------------------------------------------------
    videoListAxios = async () => {
        console.log("hello");
        const videoUrl = this.urlObj.videoList + this.props.clickSub;
        await axios.post(videoUrl).then( res => {
            console.log(res);
            this.setState({
                videoList : res.data.result
            })
        }).catch(err => console.error(err));
    }

    //---------------------------------------------------------------영상 다시보기 View-------------------------------------------------------
    videoView = () => {
        return ( 
                <div className="Home_Content_Option_Frame"> 
                    <div> 
                        <h3> 영상 </h3>
                    </div>
                    <div className="Home_Content_GroupAdd_Main"  > 
                        <table>
                            <tbody>
                                <this.videoListViewMap />
                            </tbody>
                        </table>
                    </div>
                </div>
            )
    }

    //---------------------------------------------------------영상 리스트 map------------------------------------------------------------
    videoListViewMap = () =>{
        const lists1 = this.state.videoList != null ? this.state.videoList.map( ( list ) => {
            const subTitle = (list.subTitle != null) ? list.subTitle : list.fileName;
            if(list.favorite === 1) {
                return (
                    <div style={{
                        border : "black solid 1px",
                        width : "300px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div>
                            {subTitle}
                            <div style={{
                                display : "inlineBlock",
                                float : "right",
                            }}>
                                <button onClick={() => {this.subTitleChange(list.id)}}>이름 변경</button>
                                <button onClick={() => {this.subFaorite()}}> 즐겨 찾기 </button>
                            </div>
                        </div>
                    </div>
                )
        }}) : null;
        const lists2 = this.state.videoList != null ? this.state.videoList.map( ( list ) => {
            const subTitle = (list.subTitle != null) ? list.subTitle : list.fileName;
            if(list.favorite === 0) {
                return (
                    <div style={{
                        border : "black solid 1px",
                        width : "300px",
                        margin : "3px",
                        fontSize : "20px",
                    }}> 
                        <div>
                            {subTitle}
                            <div style={{
                                display : "inlineBlock",
                                float : "right",
                            }}>
                                <button onClick={() => {this.subTitleChange(list.id)}}>이름 변경</button>
                            </div>
                        </div>
                    </div>
                )
        }}) : null;
        return (
            <div style={{margin : "10px"}}> 
                <div>
                    <h3>즐겨찾기 한 영상</h3>
                    {lists1}
                </div>
                <div>
                    <h3>영상 목록</h3>
                    {lists2}
                </div>
            </div>
        )
    }

    //----------------------------------------------영상 즐겨찾기----------------------------------------
    subFaorite = () => {
        console.log("즐겨찾기"); 
    }

    //----------------------------------------------영상 소제목 설정-----------------------------------------------
    subTitleChange = async(id) => {
        const titleUrl = this.urlObj.videoTitle + id;
        console.log(titleUrl);
        await axios.post(titleUrl, {data : {subTitle : "change"}})
        .then((res) => {
            console.log(res);
            this.videoListAxios();
        })
    }

    //-------------------------------------------랜더 설정---------------------------------------------
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
        // qna 리스트
        if(this.props.optionState === "qna"){
            this.qnaListAxios();
            return (<div></div>)
        }
        // qna 과목 view
        if(this.props.optionState === "qnaView"){
            return this.qnaView();
        }
        // video 엑시오스
        if(this.props.optionState === "video") {
            this.videoListAxios();
            return (<div></div>)
        }
        //video 띄우기
        if(this.props.optionState === "videoView") {
            return this.videoView();
        }
        if(this.optionState === "qnaPlusView"){
            return this.qnaPlus();
        }
        return (<>
        </>
        )
    }
}