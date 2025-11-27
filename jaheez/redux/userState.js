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
                numberOfTrips:action.payload.numberOfTrips,
                warrnings:action.payload.warrnings,
                isBanned:action.payload.isBanned,
                isVerified:action.payload.isVerified,
                token:action.payload.token,
            }
            state.user = user
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