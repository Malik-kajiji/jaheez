import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userActions } from "../redux/userState";
import { driverActions } from "../redux/driverState";

const UserState = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const segments = useSegments();
    const { login } = userActions;
    const { login:driverLogin } = driverActions;

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    
    useEffect(() => {
        AsyncStorage.getItem('loginInfo').then(res => {
            const loginInfo = JSON.parse(res);
            if(loginInfo?.userType === 'driver'){
                getDriverData(loginInfo.token);
            }else{
                getData(loginInfo.token);
            }
        }).catch(err => {
            console.log(err.message);
        })

        const getData = async (token) => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/user/get-data`,{
                    method:'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${token}`
                    }
                });

                const json = await res.json();
                if(res.status === 401){
                    await AsyncStorage.clear();
                    return;
                }
                if(!res.ok){
                    throw Error(json.message);
                }
                
                const {
                    username,
                    phoneNumber,
                    numberOfTrips,
                    warrnings,
                    isBanned,
                    isVerified
                } = json;

                dispatch(login({username,phoneNumber,numberOfTrips,warrnings,isBanned,isVerified,token}));
                
                // Redirect to user home if not already there
                const inAuthGroup = segments[0] === '(user)';
                if (!inAuthGroup) {
                    router.replace('/(user)/home');
                }
            }catch(err){
                console.log(err.message);
                await AsyncStorage.clear();
            }
        };

        const getDriverData = async (token) => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/driver/get-data`,{
                    method:'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${token}`
                    }
                });
                const json = await res.json();
                if(res.status === 401){
                    await AsyncStorage.clear();
                    return;
                }
                if(!res.ok){
                    throw Error(json.message);
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
                    warrnings,
                    isBanned,
                    verificationStatus,
                    verificationReason,
                    isVerified,
                    balance
                } = json;
                dispatch(driverLogin({driverName,phoneNumber,state,carPlate,carImage,ratings,vechicleType,vechicleModel,numberOfTrips,warrnings,isBanned,verificationStatus,verificationReason,isVerified,balance,token}));
                
                // Redirect to driver home if not already there
                const inAuthGroup = segments[0] === '(driver)';
                if (!inAuthGroup) {
                    router.replace('/(driver)/home');
                }
            }catch(err){
                console.log(err.message);
                await AsyncStorage.clear();
            }
        };
    },[]);
    
    return (
        <></>
    );
};

export default UserState;