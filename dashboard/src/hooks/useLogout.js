import React from 'react'
import { useDispatch } from 'react-redux';
import { userActions } from '../redux/userState';
import { alertActions } from '../redux/AlertController';

const useLogout = () => {
    const dispatch = useDispatch()
    const logout = () => {
        localStorage.clear()
        dispatch(userActions.clearData({}))
        dispatch(alertActions.showAlert({msg:'تم تسجيل الخروج بنجاح',type:'success'}));
    }

    return {logout}
}

export default useLogout