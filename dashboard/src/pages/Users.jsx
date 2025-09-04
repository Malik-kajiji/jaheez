import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import '../styles/home.scss'

export const Users = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user])

    return (
        <section className='container users'>
            <h1 className="TXT-heading color-normal">المستخدمون</h1>
            <p className="TXT-normal color-light">إدارة المستخدمين</p>
        </section>
    )
}