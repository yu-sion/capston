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
            stdList : null,
            userInfo : null,
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
        if(this.state.stdList != prevState.stdList){
            console.log(this.state.stdList);
            this.setOptionState("prtStd");
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

    render(){
        if(this.props.optionState == "add"){
            return this.prtGroup_Add();
        }
        if(this.props.optionState == "stdList"){
            this.subjectStdList();
        }
        if(this.props.optionState == "prtStd"){
            return (
            <div>
                <this.prtSubjectStdList />
                {this.state.userInfo}
            </div>
            )
        }
        return (<>
        </>
        )
    }
}

//---------------------------------------------------------------- 해당 과목 유저 목록------------------------------------------------------------
