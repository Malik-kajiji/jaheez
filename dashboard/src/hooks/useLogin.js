import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { userActions } from '../redux/userState';
import { alertActions } from '../redux/AlertController';


const useLogin = () => {
    const [loading,setLoading] = useState(false);
    const dispatch = useDispatch()

    const adminLogin = async (username,password)=>{
        setLoading(true)
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/login`,{
                method:'POST',
                body: JSON.stringify({username,password}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const json = await res.json();

            if(res.ok){
                localStorage.setItem('user',JSON.stringify(json))
                dispatch(alertActions.showAlert({msg:'تم الدخول بنجاح',type:'success'}))
                dispatch(userActions.setUserData({
                    username:json.username,
                    token:json.token,
                    access:json.access
                }))
            }else {
                dispatch(alertActions.showAlert({msg:json.message,type:'error'}));
            }
        }catch(err){
            dispatch(alertActions.showAlert({msg:err.message,type:'error'}));
        }
        setLoading(false)
    }

    return {loading,adminLogin}
}

export default useLogin