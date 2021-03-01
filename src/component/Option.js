import React from "react";


export default class Option extends React.Component{
    constructor(props){
        super(props);

        const userId = props.userId || null;
        const userType = props.userType || null;
        const userNum = props.userNum || null;
        const classId = props.classId || null;
        const option = props.option || null;

        this.state = {
            userId : userId,
            userType : userType,
            classId : classId,
            option : option
        }

    }
    

    render(){
        <div className="Option_Main">
            <div className="Option_Logo_Frame">  </div>
            <div className="Option_Content_Frame">  </div>
            <div className="Option_Bar_Frame">  </div>
        </div>
    }
}