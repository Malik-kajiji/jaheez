import { configureStore } from '@reduxjs/toolkit'
import { userController } from '../redux/userState'


export const store = configureStore({
    reducer:{
        [userController.name]:userController.reducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false,
    }),
})