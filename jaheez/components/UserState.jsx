import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userActions } from "../redux/userState";

const UserState = () => {
    const dispatch = useDispatch()
    const { login } = userActions

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    
    
    
    useEffect(()=>{
        // AsyncStorage.clear()
        AsyncStorage.getItem('token').then(res => {
            if(res){
                getData(res)
            }else {

            }
        })

        const getData = async (token) => {
            try {
                const res = await fetch(`${BACKEND_URL}/user/get-user-data`,{
                    method:'GET',
                    headers: {
                        'Content-Type':'application/json',
                        'authorization': `bearer ${token}`
                    }
                })

                const json = await res.json()
                if(res.status === 401){
                    AsyncStorage.clear()
                }
                if(!res.ok){
                    throw Error(json.message)
                }
                const {
                    username,
                    phoneNumber,
                    locations,
                    isBanned,
                    isVerified,
                    favorites:favoritesProducts,
                } = json

                dispatch(login({username,phoneNumber,isBanned,isVerified,token}))
            }catch(err){
                console.log(err.message)
            }
        }
    },[])
    return (
        <></>
    )
}

export default UserState;