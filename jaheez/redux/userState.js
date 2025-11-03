import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage'

export const userController = createSlice({
    name:'userController',
    initialState:{user:null},
    reducers: {
        login: (state,action) => {
            const user = {
                username:action.payload.username,
                phoneNumber:action.payload.phoneNumber,
                isBanned:action.payload.isBanned,
                isVerified:action.payload.isVerified,
                token:action.payload.token,
            }
            state.user = user
            AsyncStorage.setItem('user',JSON.stringify({...user}))
        },
        logOut: (state,action) => {
            state.user = null
        },
        verifyUser: (state,action) => {
            state.user = {...state.user,isVerified:true}
        }
    }
})

export const userActions = userController.actions