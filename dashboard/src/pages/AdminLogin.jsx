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
    const [errors, setErrors] = useState({})
    const { username, password } = formData

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!username.trim()) {
            newErrors.username = 'اسم المستخدم مطلوب'
        }
        if (!password.trim()) {
            newErrors.password = 'كلمة المرور مطلوبة'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleClick = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            dispatch(alertActions.showAlert({ msg: 'تأكد من ادخال البيانات', type: 'warrning' }))
            return
        }
        try {
            await adminLogin(username, password)
        } catch (error) {
            setErrors({
                username: 'خطأ في اسم المستخدم أو كلمة المرور',
                password: 'خطأ في اسم المستخدم أو كلمة المرور'
            })
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
    }, [user, navigate])

    return (
        <section className='admin-login'>
            <div className="login-container">
                <div className="logo">
                    <img src="/images/logo.png" alt="Logo" />
                </div>
                <h2>تسجيل الدخول للوحة التحكم</h2>
                <form onSubmit={handleClick}>
                    <div className={`input-group ${errors.username ? 'error' : ''}`}>
                        <label htmlFor="username" className='TXT-normal'>اسم المستخدم</label>
                        <input
                            type="text"
                            id="username"
                            name='username'
                            value={username}
                            onChange={handleChange}
                            placeholder="ادخل اسم المستخدم"
                            aria-label="اسم المستخدم"
                            aria-invalid={errors.username ? 'true' : 'false'}
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>
                    <div className={`input-group ${errors.password ? 'error' : ''}`}>
                        <label htmlFor="password" className='TXT-normal'>كلمة المرور</label>
                        <input
                            type="password"
                            id="password"
                            name='password'
                            value={password}
                            onChange={handleChange}
                            placeholder="ادخل كلمة المرور"
                            aria-label="كلمة المرور"
                            aria-invalid={errors.password ? 'true' : 'false'}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>
                    <button 
                        type="submit"
                        className={`P-BTN ${loading ? 'clicked' : ''}`}
                        disabled={loading}
                        aria-label={loading ? 'جاري تسجيل الدخول' : 'تسجيل الدخول'}
                    >
                        {loading ? 'جاري التحميل...' : 'دخول'}
                    </button>
                </form>
                <div className="theme-toggle">
                    <span>السطوع</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            aria-label="تبديل السطوع"
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </section>
    )
}
