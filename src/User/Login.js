import React, { useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import '../css/Login.css';

// import Log_Check from '../Function/Login_Func';
// import { response } from 'express';

export default function Login() {
    // Page Move
    const history = useHistory();

    const responseGoogle = async (response) => {    
        if(response){
            const data = {
                mail : response.profileObj.email,
                name : response.profileObj.name,
            }
            // req.query.data.mail
            await axios.post('http://54.146.88.72:3000/index/login' , {data : {mail : data.mail}} )
            .then((res) => {
                
                if(!res.data.result){
                    // Data is NaN
                    localStorage.setItem('info_data', JSON.stringify(data));
                    alert('가입 되지 않았습니다.\n추가 정보를 기입해 주세요.');
                    history.push('Info');
                }else {
                    // Data is true
                    alert('가입된 이용자 입니다.')
                    localStorage.setItem('user_id', JSON.stringify(res.data.result[0].id));
                    localStorage.setItem('data_user', JSON.stringify(res.data.result[0]));
                    console.log(res.data.result[0]);
                    history.push('Home');
                }
            })   //axios 기능을 통한 post 사용및 name 값 전달.
            
        }
    };

    return (
        <div className='Login_Main_Line'>
            <div className='sinzuku_logo'></div>
                <div className='Login_Btn'>
                    <GoogleLogin
                        clientId="1098599664574-dks3nufmqlqommmrd79k205n76ttp8o4.apps.googleusercontent.com"
                        buttonText="GoogleLogin"
                        onSuccess={responseGoogle}
                        onFailure={responseGoogle}
                        cookiePolicy={'single_host_origin'} 
                    />
            </div>
        </div>
    );
}
