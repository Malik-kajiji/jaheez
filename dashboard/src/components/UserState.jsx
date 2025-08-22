import { userActions } from '../redux/userState'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
// import Store from 'electron-store'

const UserState = () => {
    // const userStore = new Store()
    const dispatch = useDispatch();


    useEffect(()=>{
        // const data = userStore.get('user')
        const data = JSON.parse(localStorage.getItem('user'))
        if(data){
            dispatch(userActions.setUserData({...data}))
        }
    },[])
    return (
        <></>
    )
}

export default UserState