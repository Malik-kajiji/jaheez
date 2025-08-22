import { alertController } from '../redux/AlertController';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { userController } from '../redux/userState';


export const store = configureStore({
    reducer:{
        [alertController.name]:alertController.reducer,
        [userController.name]:userController.reducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false,
    }),
});