import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userActions } from "../redux/userState";

const UserState = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const segments = useSegments();
    const { login } = userActions;

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    
    useEffect(() => {
        AsyncStorage.getItem('token').then(res => {
            if(res){
                getData(res);
            }
        });

        const getData = async (token) => {
            try {
                const res = await fetch(`${BACKEND_URL}/user/get-user-data`,{
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
                    router.replace('/(user)');
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