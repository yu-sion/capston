import React,{ useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
   
function User_Info({setUserData, userData}) {
    const user_datas = JSON.parse(localStorage.getItem('info_data')); 

    const history = useHistory(); 
    const handleData = (e)=>{
        e.preventDefault()
        const data = {
            userName  : e.target.name.value,
            id    : e.target.usrId.value,
            mail  : e.target.email.value,
            phone : e.target.phoneNumber.value,
            type  : e.target.job.value,
        }
        axios.post('http://54.146.88.72:3000/index/addinfo' , {data} )
            .then((res) => {
                console.log(res);
                localStorage.setItem('data_user', JSON.stringify(data));
        })
        history.push('home')
    }
    useEffect(()=>{
        console.log(userData);
    },[userData])


      return (
    <div className="Main_Body">
            <div className="Main_Form">
                <div className="Main_Form_Value">
                    <form id='test' onSubmit={handleData} >
                    <table className="Main_inputTable">
                        <tbody>
                            <tr>
                                <td> 이름 </td>
                                <td> <input type="text" name="name" defaultValue={user_datas.name}/> </td>
                            </tr>
                            <tr>
                                <td> 이메일 </td>
                                <td> <input type="text" name="email" value={user_datas.mail} /> </td>
                            </tr>
                            <tr>
                                <td> 학번 </td>
                                <td> <input type="number" 
                                            name="usrId" 
                                            placeholder="학번은 7자리 입니다." 
                                            required/> </td>
                            </tr>
                            <tr>
                                <td> 직업 </td>
                                <td> <div>
                                    <input type="radio" name="job" id="teacher" value="professor"/>
                                    <label htmlFor="teacher" > 교수님 </label>
                                    <input type="radio" name="job" id="student" value="student"/>
                                    <label htmlFor="student" > 학생 </label>
                                </div> </td>
                            </tr>
                            <tr>
                                <td> 전화번호 </td>
                                <td> <input type="number" name="phoneNumber" placeholder="전화번호를 입력해 주세요." required></input> </td>
                            </tr>
                            <tr>
                                <td colSpan="2"> <button> 로그인 </button> </td>
                            </tr>
                        </tbody>
                    </table>
                    </form>
                </div>
            </div>
        </div>
      );
}



export default User_Info;
