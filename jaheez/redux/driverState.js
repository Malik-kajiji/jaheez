import { createSlice } from '@reduxjs/toolkit';


export const driverController = createSlice({
    name:'driverController',
    initialState:{driver:null},
    reducers: {
        login: (state,action) => {
            const driver = {
                driverName:action.payload.driverName,
                phoneNumber:action.payload.phoneNumber,
                state:action.payload.state,
                carPlate:action.payload.carPlate,
                carImage:action.payload.carImage,
                ratings:action.payload.ratings,
                vechicleType:action.payload.vechicleType,
                vechicleModel:action.payload.vechicleModel,
                numberOfTrips:action.payload.numberOfTrips,
                balance: action.payload.balance,
                warrnings:action.payload.warrnings,
                isBanned:action.payload.isBanned,
                isVerified:action.payload.isVerified,
                verificationStatus:action.payload.verificationStatus,
                verificationReason:action.payload.verificationReason,
                token:action.payload.token,
                subscription: action.payload.subscription,
                scheduledSubscription: action.payload.scheduledSubscription,
            }
            state.driver = driver
        },
        logOut: (state,action) => {
            state.driver = null
        },
        verifydriver: (state,action) => {
            state.driver = {...state.driver,isVerified:true}
        },
        updateDriver: (state, action) => {
            state.driver = { ...state.driver, ...action.payload }
        }
    }
})

export const driverActions = driverController.actions