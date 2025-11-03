import { useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification'
import { userActions } from '../redux/userState'
import { useState } from 'react'

const useLogin = () => {
    const dispatch = useDispatch()
    const user = useSelector(state => state.userController.user)
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const [isSignupLoading,setIsSignUpLoading] = useState(false)
    const [isResetLoading,setIsResetLoading] = useState(false)
    const [error,setError] = useState(null)

    const { logOut,login,verifyUser } = userActions

    const loginAsUser = async (phoneNumber,password) => {
        setIsSignUpLoading(true)
        if((phoneNumber.length < 10 || !phoneNumber.startsWith('09'))){
            setError('الرجاء إدخال رقم صالح!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رقم صالح!',
            })
        }else if(password.length < 8){
            setError('الرجاء إدخال رمز لا يقل عن 8 أحرف!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رمز لا يقل عن 8 أحرف!',
            })
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/user/login`,{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({phoneNumber,password})
                })

                const json = await res.json()
                if(!res.ok){
                    setError(json.message)
                    throw Error(json.message)
                }
                const { username,locations,isBanned,isVerified,favorites,token } = json
                AsyncStorage.setItem('token',token)
                dispatch(login({username,phoneNumber,isBanned,isVerified,token}))
            }catch(err){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: err.message,
                })
            }
        }
        setIsSignUpLoading(false)
    }
    //signup functions
    const getLocations = async () => {
        try {
            const res = await AsyncStorage.getItem('locations')
            if(res){
                return JSON.parse(res)
            }else {
                return []
            }            
        } catch (error) {
            return [];
        }
    }

    const signUp = async (phoneNumber,username,password) => {
        if((phoneNumber.length < 10 || !phoneNumber.startsWith('09'))){
            setError('الرجاء إدخال رقم هاتف صالح!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رقم هاتف صالح!',
            })
        }else if(username.length < 3){
            setError('الرجاء إدخال اسم مستخدم صالح!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال اسم مستخدم صالح!',
            })
        }else if(password.length < 8){
            setError('الرجاء إدخال رمز لا يقل عن 8 أحرف!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رمز لا يقل عن 8 أحرف!',
            })
        }else {
            setIsSignUpLoading(true)
            try {

                const res = await fetch(`${BACKEND_URL}/user/sign-up`,{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({username,phoneNumber,password})
                })

                const json = await res.json()
                const { locations,isBanned,isVerified,favorites,cartItems,token } = json

                if(!res.ok){
                    setError(json.message)
                    throw Error(json.message)
                }
                AsyncStorage.setItem('token',token)
                dispatch(login({username,phoneNumber,isBanned,isVerified,token}))
            }catch(err){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: err.message,
                })
            }
            setIsSignUpLoading(false)
        }
    }
    const verifyUserByCode = async (code,setIsShowen) => {
        if(code.length < 4){
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال كود صحيح!',
            })
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/user/verify-user`,{
                    method:'PUT',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${user?.token}`
                    },
                    body:JSON.stringify({code})
                })

                const json = await res.json()
                if(!res.ok){
                    throw Error(json.message)
                }
                dispatch(verifyUser())
                setIsShowen(false)
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: json.message,
                })
            }catch(err){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: err.message,
                })
            }
        }
    }
    const handleLogOut = () => {
        AsyncStorage.clear().then(()=>{
            dispatch(logOut())
        })
    }
    const getUserData = async () => {
        try {
            const storageToken = await AsyncStorage.getItem('token')
            const res = await fetch(`${BACKEND_URL}/user/get-user-data`,{
                method:'GET',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${storageToken}`
                }
            })
            const json = await res.json()
            const {
                username,
                phoneNumber,
                locations,
                isBanned,
                isVerified,
                favorites,
                cartItems
            } = json

            dispatch(login({username,phoneNumber,isBanned,isVerified,token:storageToken}))
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
    }
    const handleResendMessage = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/user/resend-message`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${user?.token}`
                },
            })

            const json = await res.json()
            if(!res.ok){
                throw Error(json.message)
            }
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تم الإرسال',
                textBody: json.message,
            })
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
    }
    const handleDeleteAccount = async (password) => {
        if(password === ''){
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال الرمز',
            })
        }else {
            try {    
                const res = await fetch(`${BACKEND_URL}/user/delete-user`,{
                    method:'DELETE',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${user?.token}`
                    },
                    body:JSON.stringify({password})
                })
    
                if(!res.ok){
                    throw Error('json.message')
                }
                setTimeout(()=>{
                    handleLogOut()
                },1000)
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: 'تم حذف حسابك بنجاح!',
                    button: 'إغلاق',
                })
            }catch(err){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: err.message,
                })
            }
        }
    }

    const handleSendResetMessage = async (phoneNumber) => {
        setIsResetLoading(true)
        try {
            const res = await fetch(`${BACKEND_URL}/user/send-reset-message`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({phoneNumber})
            })

            const json = await res.json()
            if(!res.ok){
                throw Error(json.message)
            }
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تم الإرسال',
                textBody: json.message,
            })
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
        setIsResetLoading(false)
    }

    const handleResetPassword = async (code,newPassword,setIsShowen) => {
        setIsResetLoading(true)
        try {
            const res = await fetch(`${BACKEND_URL}/user/reset-password`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({code,newPassword})
            })

            const json = await res.json()
            if(!res.ok){
                throw Error(json.message)
            }
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تمت العملية بنجاح!',
                textBody: 'يمكنك الان تسجيل الدخول بكلمة المرور الجديدة بنجاح',
            })
            setIsShowen(false)
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
        setIsResetLoading(false)
    }

    return {loginAsUser,signUp,verifyUserByCode,handleLogOut,getUserData,handleResendMessage,isSignupLoading,handleDeleteAccount,handleSendResetMessage,handleResetPassword,isResetLoading,error}
}

export default useLogin