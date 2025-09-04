import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import '../styles/adminLogin.scss'
import { Link, useNavigate } from 'react-router-dom'
import useLogin from '../hooks/useLogin'
import { alertActions } from '../redux/AlertController'

export const AdminLogin = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const { loading, adminLogin } = useLogin()
    const dispatch = useDispatch()

    const [formData, setFormData] = useState({ username: '', password: '' })
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const { username, password } = formData

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleClick = (e) => {
        e.preventDefault()
        if (username === '' || password === '') {
            dispatch(alertActions.showAlert({ msg: 'تأكد من ادخال البيانات', type: 'warrning' }))
        } else {
            adminLogin(username, password)
        }
    }

    const toggleTheme = (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.querySelector('.App').classList.toggle('dark', e.target.checked)
    }

    useEffect(() => {
        // Apply theme on component mount
        document.querySelector('.App').classList.toggle('dark', theme === 'dark')
    }, [])

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user])

    return (
        <section className='admin-login'>
            <div className="login-container">
                <div className="logo">
                    <img src="/images/logo.png" alt="Logo" />
                </div>
                <form>
                    <div className="input-group">
                        <label htmlFor="username" className='TXT-normal'>اسم المستخدم</label>
                        <input
                            type="text"
                            id="username"
                            name='username'
                            value={username}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" className='TXT-normal'>كلمة المرور</label>
                        <input
                            type="password"
                            id="password"
                            name='password'
                            value={password}
                            onChange={handleChange}
                        />
                    </div>
                    <button 
                        className={`P-BTN ${loading ? 'clicked' : ''}`} 
                        onClick={handleClick}
                    >
                        دخول
                    </button>
                </form>
                <div className="theme-toggle">
                    <span>السطوع</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </section>
    )
}
