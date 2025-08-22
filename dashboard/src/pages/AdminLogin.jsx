import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/adminLogin.scss'
import { Link, useNavigate } from 'react-router-dom'
import useLogin from '../hooks/useLogin'
import { alertActions } from '../redux/AlertController'

export const AdminLogin = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const { loading,adminLogin } = useLogin()
    const dispatch = useDispatch()

    const [formData,setFormData] = useState({username:'',password:''})
    const { username , password } = formData

    const handleChange = (e) => {
        const { name , value } = e.target
        setFormData(prev => ({...prev,[name]:value}))
    }

    const handleClick = (e) => {
        e.preventDefault()
        if(username === '' || password === ''){
            dispatch(alertActions.showAlert({msg:'تأكد من ادخال البيانات',type:'warrning'}))
        }else {
            adminLogin(username,password)
        }
    }

    useEffect(()=>{
        if(user){
            navigate('/')
        }
    },[user])
    return (
        <section className='admin-login'>
            <form>
                <label htmlFor="username" className='TXT-normal'>اسم المستخدم</label>
                <input 
                    type="text"
                    name='username'
                    value={username}
                    onChange={handleChange}
                    />
                <label htmlFor="password" className='TXT-normal'>كلمة المرور</label>
                <input 
                    type="password" 
                    name='password'
                    value={password}
                    onChange={handleChange}
                    />
                <button className={`P-BTN ${loading && 'clicked'}`} onClick={handleClick}>
                    دخول
                </button>
            </form>
        </section>
    )
}
