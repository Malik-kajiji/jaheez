import { useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification'
import { driverActions } from '../redux/driverState'
import { useState } from 'react'
import { useRouter } from 'expo-router'

const useLogin = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const driver = useSelector(state => state.driverController.driver)
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const [isSignupLoading,setIsSignUpLoading] = useState(false)
    const [isLoginLoading,setIsLoginLoading] = useState(false)
    const [isResetLoading,setIsResetLoading] = useState(false)
    const [error,setError] = useState(null)
    const [isVerificationLoading,setIsVerificationLoading] = useState(false)

    const { logOut,login,verifydriver } = driverActions

    const handleUnauthorized = async (msg = 'انتهت الجلسة، يرجى تسجيل الدخول مجددًا') => {
        await AsyncStorage.removeItem('loginInfo')
        await AsyncStorage.removeItem('expoToken')
        dispatch(logOut())
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'تم تسجيل الخروج',
            textBody: msg,
        })
        router.replace('/')
    }

    const loginAsDriver = async (phoneNumber,password,expoToken) => {
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
                const res = await fetch(`${BACKEND_URL}/api/driver/login`,{
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

                const { driverName,phoneNumber:driverPhone,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason,token } = json
                await AsyncStorage.setItem('loginInfo', JSON.stringify({ userType: 'driver', token }))
                if(expoToken) {
                    await AsyncStorage.setItem('expoToken',expoToken)
                }

               
                dispatch(login({driverName,phoneNumber:driverPhone,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason,token}))
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: 'تم تسجيل الدخول بنجاح',
                })
                
                router.replace('/(driver)/home')
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
                const res = await fetch(`${BACKEND_URL}/api/driver/signup`,{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({driverName:`${firstName} ${lastName}`,phoneNumber,password,expoToken})
                })

                const json = await res.json()

                if(!res.ok){
                    setError(json.message)
                    throw Error(json.message)
                }
                
                const { driverName,phoneNumber:driverPhone,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason,token } = json
                await AsyncStorage.setItem('loginInfo', JSON.stringify({ userType: 'driver', token }))
                
                if(expoToken) {
                    await AsyncStorage.setItem('expoToken',expoToken)
                }
                dispatch(login({driverName,phoneNumber:driverPhone,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason,token}))
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'نجاح',
                    textBody: 'تم إنشاء الحساب بنجاح',
                })
                
                router.replace('/(driver)/home')
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
    
    const verifyDriverByCode = async (OTPCode,setIsShowen) => {
        if(OTPCode.length < 4){
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء إدخال كود صحيح!',
            })
        }else {
            try {
                const res = await fetch(`${BACKEND_URL}/api/driver/verify-driver`,{
                    method:'PUT',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${driver?.token}`
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
                dispatch(verifydriver())
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
                    // textBody: 'كود التحقق غير صحيح',
                    textBody: err.message,
                })
            }
        }
    }
    
    const handleLogOut = async () => {
        try {
            await AsyncStorage.removeItem('loginInfo')
            await AsyncStorage.removeItem('expoToken')
            dispatch(logOut())
            router.replace('/')
        } catch(err) {
            console.error('Logout error:', err)
        }
    }
    
    const getDriverData = async () => {
        try {
            const loginInfo = await AsyncStorage.getItem('loginInfo')
            const parsedLoginInfo = JSON.parse(loginInfo);
            const storageToken = parsedLoginInfo?.token;
            if(!storageToken) {
                throw new Error('No token found in storage');
            }

            const res = await fetch(`${BACKEND_URL}/api/driver/get-data`,{
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
                driverName,
                phoneNumber,
                state,
                carPlate,
                carImage,
                ratings,
                vechicleType,
                vechicleModel,
                numberOfTrips,
                balance,
                warrnings,
                isBanned,
                isVerified,
                verificationStatus,
                verificationReason
            } = json

            dispatch(login({driverName,phoneNumber,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,balance,warrnings,isBanned,isVerified,verificationStatus,verificationReason,token:storageToken}))
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
            const res = await fetch(`${BACKEND_URL}/api/driver/send-reset-message`,{
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
            const res = await fetch(`${BACKEND_URL}/api/driver/resend-message`,{
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
            const res = await fetch(`${BACKEND_URL}/api/driver/check-reset-code`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${driver?.token}`
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
            const res = await fetch(`${BACKEND_URL}/api/driver/reset-password`,{
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
            await AsyncStorage.removeItem('loginInfo')
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

    const submitDriverVerification = async ({carPlate,carImageBase64,vechicleType,vechicleModel}) => {
        if(!carPlate || !carImageBase64 || !vechicleType || !vechicleModel){
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'ملاحظة',
                textBody: 'الرجاء تعبئة جميع الحقول وإرفاق صورة المركبة',
            })
            return false
        }

        setIsVerificationLoading(true)
        try {
            const res = await fetch(`${BACKEND_URL}/api/driver/submit-verification`,{
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                    'authorization': `bearer ${driver?.token}`
                },
                body:JSON.stringify({carPlate,carImage:carImageBase64,vechicleType,vechicleModel})
            })

            const json = await res.json()
            if(res.status === 401){
                await handleUnauthorized(json?.error || json?.message)
                return false
            }
            if(!res.ok){
                throw Error(json.message)
            }

                const {
                    driverName = driver?.driverName,
                    phoneNumber = driver?.phoneNumber,
                    state = driver?.state,
                    carPlate: updatedPlate,
                    carImage,
                    ratings = driver?.ratings,
                    vechicleType: updatedType,
                    vechicleModel: updatedModel,
                    numberOfTrips = driver?.numberOfTrips,
                    balance = driver?.balance,
                    warrnings = driver?.warrnings,
                    isBanned = driver?.isBanned,
                    isVerified = driver?.isVerified,
                    verificationStatus = driver?.verificationStatus,
                    verificationReason = driver?.verificationReason,
                } = json?.driver || {}

                dispatch(login({
                    driverName,
                    phoneNumber,
                    state,
                    carPlate: updatedPlate,
                    carImage,
                    ratings,
                    vechicleType: updatedType,
                    vechicleModel: updatedModel,
                    numberOfTrips,
                    balance,
                    warrnings,
                    isBanned,
                    isVerified,
                    verificationStatus,
                    verificationReason,
                    token: driver?.token
                }))

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'تم الإرسال',
                textBody: json?.message || 'تم إرسال طلب التوثيق بنجاح',
            })
            return true
        }catch(err){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'خطأ',
                textBody: err.message,
            })
            return false
        }finally{
            setIsVerificationLoading(false)
        }
    }

    return {loginAsDriver,signUp,verifyDriverByCode,handleLogOut,getDriverData,handleResendMessage,isSignupLoading,isLoginLoading,handleSendResetMessage,handleResetPassword,handleCheckResetCode,isResetLoading,error,submitDriverVerification,isVerificationLoading}
}

export default useLogin
