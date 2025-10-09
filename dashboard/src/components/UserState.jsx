import React, { useEffect } from 'react'
import useLogin from '../hooks/useLogin';
// import Store from 'electron-store'

const UserState = () => {
    const { getAdminAccess } = useLogin()


    useEffect(()=>{
        getAdminAccess()
    },[])
    return (
        <></>
    )
}

export default UserState