import { useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification'
import { userActions } from '../redux/userState'
import { useState } from 'react'
import { useRouter } from 'expo-router'

const useLogin = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const user = useSelector(state => state.userController.user)
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const [isSignupLoading,setIsSignUpLoading] = useState(false)
    const [isLoginLoading,setIsLoginLoading] = useState(false)
    const [isResetLoading,setIsResetLoading] = useState(false)
    const [error,setError] = useState(null)

    const { logOut,login,verifyUser } = userActions

    const handleUnauthorized = async (msg = 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا') => {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('expoToken')
        dispatch(logOut())
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'تم تسجيل الخروج',
            textBody: msg,
        })
        router.replace('/')
    }

    const loginAsUser = async (phoneNumber,password,expoToken) => {
        setIsLoginLoading(true)
        if((phoneNumber.length < 10 || !phoneNumber.startsWith('09'))){
            setError('الرجاء إدخال رقم صالح!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رقم صالح!',
            })
            setIsLoginLoading(false)
        }else if(password.length < 8){
            setError('الرجاء إدخال رمز لا يقل عن 8 أحرف!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رمز لا يقل عن 8 أحرف!',
            })
            setIsLoginLoading(false)
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/api/user/login`,{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({phoneNumber,password,expoToken})
                })

                const json = await res.json()
                if(!res.ok){
                    setError(json.message)
                    throw Error(json.message)
                }

                const { username,phoneNumber:userPhone,numberOfTrips,warrnings,isBanned,isVerified,token } = json
                await AsyncStorage.setItem('token',token)
                if(expoToken) {
                    await AsyncStorage.setItem('expoToken',expoToken)
                }
                dispatch(login({username,phoneNumber:userPhone,numberOfTrips,warrnings,isBanned,isVerified,token}))
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: 'تم تسجيل الدخول بنجاح',
                })
                
                router.replace('/(user)/home')
            }catch(err){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: err.message,
                })
            }
            setIsLoginLoading(false)
        }
    }

    const signUp = async (phoneNumber,firstName,lastName,password,expoToken) => {
        setIsSignUpLoading(true)
        if((phoneNumber.length < 10 || !phoneNumber.startsWith('09'))){
            setError('الرجاء إدخال رقم هاتف صالح!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رقم هاتف صالح!',
            })
            setIsSignUpLoading(false)
        }else if(!firstName || firstName.length < 2){
            setError('الرجاء إدخال الاسم الأول!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال الاسم الأول!',
            })
            setIsSignUpLoading(false)
        }else if(!lastName || lastName.length < 2){
            setError('الرجاء إدخال الاسم الأخير!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال الاسم الأخير!',
            })
            setIsSignUpLoading(false)
        }else if(password.length < 8){
            setError('الرجاء إدخال رمز لا يقل عن 8 أحرف!')
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال رمز لا يقل عن 8 أحرف!',
            })
            setIsSignUpLoading(false)
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/api/user/signup`,{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({firstName,lastName,phoneNumber,password,expoToken})
                })

                const json = await res.json()

                if(!res.ok){
                    setError(json.message)
                    throw Error(json.message)
                }
                
                const { username,phoneNumber:userPhone,numberOfTrips,warrnings,isBanned,isVerified,token } = json
                await AsyncStorage.setItem('token',token)
                if(expoToken) {
                    await AsyncStorage.setItem('expoToken',expoToken)
                }
                dispatch(login({username,phoneNumber:userPhone,numberOfTrips,warrnings,isBanned,isVerified,token}))
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: 'تم إنشاء الحساب بنجاح',
                })
                
                router.replace('/(user)/home')
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
    
    const verifyUserByCode = async (OTPCode,setIsShowen) => {
        if(OTPCode.length < 4){
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال كود صحيح!',
            })
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/api/user/verify-user`,{
                    method:'PUT',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${user?.token}`
                    },
                    body:JSON.stringify({OTPCode})
                })

                const json = await res.json()
                if(res.status === 401){
                    await handleUnauthorized(json?.error || json?.message)
                    return
                }
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
    
    const handleLogOut = async () => {
        try {
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('expoToken')
            dispatch(logOut())
            router.replace('/')
        } catch(err) {
            console.error('Logout error:', err)
        }
    }
    
    const getUserData = async () => {
        try {
            const storageToken = await AsyncStorage.getItem('token')
            const res = await fetch(`${BACKEND_URL}/api/user/get-data`,{
                method:'GET',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${storageToken}`
                }
            })
            const json = await res.json()
            if(res.status === 401){
                await handleUnauthorized(json?.error || json?.message)
                return
            }
            const {
                username,
                phoneNumber,
                numberOfTrips,
                warrnings,
                isBanned,
                isVerified
            } = json

            dispatch(login({username,phoneNumber,numberOfTrips,warrnings,isBanned,isVerified,token:storageToken}))
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
    }
    

    const handleSendResetMessage = async (phoneNumber) => {
        setIsResetLoading(true)
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/send-reset-message`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({phoneNumber})
            })

            const json = await res.json()
            setIsResetLoading(false)
            if(!res.ok){
                throw Error(json.message)
            }

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تم الإرسال',
                textBody: json.message,
            })
            return true
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
            return false
        }
        
    }

    const handleResendMessage = async (phoneNumber) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/resend-message`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify({phoneNumber})
            })

            const json = await res.json()
            if(res.status === 401){
                await handleUnauthorized(json?.error || json?.message)
                return false
            }
            if(!res.ok){
                throw Error(json.message)
            }
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تم الإرسال',
                textBody: json.message,
            })
            return true
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
            return false
        }
    }

    const handleCheckResetCode = async (phoneNumber,OTPCode) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/check-reset-code`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify({phoneNumber,OTPCode})
            })

            const json = await res.json()
            if(res.status === 401){
                await handleUnauthorized(json?.error || json?.message)
                return false
            }
            if(!res.ok){
                throw Error(json.message)
            }

            if(json.valid){
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'الكود صحيح',
                    textBody: json.message,
                })
                return true
            }else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'خطأ',
                    textBody: 'الكود غير صحيح',
                })
                return false
            }

            
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
    }

    const handleResetPassword = async (phoneNumber,resetOtpCode,newPassword) => {
        setIsResetLoading(true)
        try {
            const res = await fetch(`${BACKEND_URL}/api/user/reset-password`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({phoneNumber,resetOtpCode,newPassword})
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

            // expire token locally so user is logged out on all sessions
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('expoToken')
            dispatch(logOut())
            router.replace('/')
            
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
        }
        setIsResetLoading(false)
    }

    return {loginAsUser,signUp,verifyUserByCode,handleLogOut,getUserData,handleResendMessage,isSignupLoading,isLoginLoading,handleSendResetMessage,handleResetPassword,handleCheckResetCode,isResetLoading,error}
}

export default useLogin