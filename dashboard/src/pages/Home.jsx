import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/home.scss'

export const Home = () => {
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()

    useEffect(()=>{
        if(!user){
            navigate('/login')
        }
    },[user])

    return (
        <section className='container home'>
            homefds
        </section>
    )
}
