import { configureStore } from '@reduxjs/toolkit'
import { userController } from '../redux/userState'
import { driverController } from '../redux/driverState'


export const store = configureStore({
    reducer:{
        [userController.name]:userController.reducer,
        [driverController.name]:driverController.reducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false,
    }),
})