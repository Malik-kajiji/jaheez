import { createSlice } from '@reduxjs/toolkit';

export const alertController = createSlice({
    name:'alertController',
    initialState:{msg:'', type:'', showen:false},
    reducers: {
        showAlert(state,action){
            state.msg = action.payload.msg
            state.type = action.payload.type
            state.showen = true
        },
        hideAlert(state,action){
            state.showen = false
        }
    }
}) 


export const alertActions = alertController.actions