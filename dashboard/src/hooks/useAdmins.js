import React, { useEffect, useState } from "react";
import { alertActions } from "../redux/AlertController";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useLogout from "./useLogout";

export const useAdmins = () => {
    const [searched,setSearched] = useState([])
    const [allAdmins,setAllAdmins] = useState([])
    const [isLoading,setIsLoading] = useState(false)
    const [addLoading,setAddLoading] = useState(false)
    const dispatch = useDispatch()
    const user = useSelector(state => state.userController.user)
    const navigate = useNavigate()
    const { logout } = useLogout()

    const handleSearch = (letters) => {
        setSearched(()=>allAdmins.filter(e => (
            e.username.startsWith(letters) || 
            e.username.includes(letters) 
        )))
    }

    const handleAdd = async (newAdmin,setIsShowen) => {
        setAddLoading(true)
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/owner-admin/create`,{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify(newAdmin)
            })
            const json = await res.json()
            if(res.status === 401){
                logout()
            }else if(res.status === 400) {
                dispatch(alertActions.showAlert({msg:json.message,type:'error'}))
            }else {
                dispatch(alertActions.showAlert({msg:'تمت إضافة المسؤول بنجاح',type:'success'}))
                setIsShowen(false)
                setAllAdmins(prev => [...prev,json])
                setSearched(prev => [...prev,json])
            }
        }catch(err){
            dispatch(alertActions.showAlert({msg:err.message,type:'error'}))
        }
        setAddLoading(false)
    }

    const handleEdit = async (access,_id,setAdminToEdit) => {
        setAddLoading(true)
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/owner-admin/edit`,{
                method:'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify({_id,access})
            })
            const json = await res.json()
            if(res.status === 401){
                logout()
            }else if(res.status === 400) {
                dispatch(alertActions.showAlert({msg:json.message,type:'error'}))
            }else {
                dispatch(alertActions.showAlert({msg:'تم التعديل المسؤول بنجاح',type:'success'}))
                setAllAdmins(prev => prev.map(e => e._id === _id ? json : e))
                setSearched(prev => prev.map(e => e._id === _id ? json : e))
                setAdminToEdit(null)
            }
        }catch(err){
            dispatch(alertActions.showAlert({msg:err.message,type:'error'}))
        }
        setAddLoading(false)
    }

    const handleDelete = async (_id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/owner-admin/delete`,{
                method:'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify({_id})
            })
            const json = await res.json()
            if(res.status === 401){
                logout()
            }else if(res.status === 400) {
                dispatch(alertActions.showAlert({msg:json.message,type:'error'}))
            }else {
                dispatch(alertActions.showAlert({msg:'تم حذف المسؤول بنجاح',type:'success'}))
                setAllAdmins(prev => prev.filter(e => e._id !== _id))
                setSearched(prev => prev.filter(e => e._id !== _id))
            }
        }catch(err){
            dispatch(alertActions.showAlert({msg:err.message,type:'error'}))
        }
    }

    const handleChangePassword = async (_id,password) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/owner-admin/change-password`,{
                method:'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${user?.token}`
                },
                body:JSON.stringify({_id,password})
            })
            const json = await res.json()
            if(res.status === 401){
                logout()
            }else if(res.status === 400) {
                dispatch(alertActions.showAlert({msg:json.message,type:'error'}))
            }else {
                dispatch(alertActions.showAlert({msg:'تم تغيير رمز المسؤول بنجاح',type:'success'}))
                setAllAdmins(prev => prev.map(e => e._id === _id ? json : e))
                setSearched(prev => prev.map(e => e._id === _id ? json : e))
            }
        }catch(err){
            dispatch(alertActions.showAlert({msg:err.message,type:'error'}))
        }
    }

    useEffect(()=>{
        if(!user){
            navigate('/admin-login')
        }else if(!user.access.includes('owner')){
            navigate('/')
        }else {
            const getData = async () => {
                setIsLoading(true)
                try {
                    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/owner-admin/get-all`,{
                        method:'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `bearer ${user?.token}`
                        }
                    })
                    const json = await res.json()
                    if(res.status === 401){
                        logout()
                    }else if(res.status === 400) {
                        dispatch(alertActions.showAlert({msg:json.message,type:'error'}))
                    }else {
                        setAllAdmins(json)
                        setSearched(json)
                    }
                }catch(err){
                    dispatch(alertActions.showAlert({msg:err.message,type:'error'}))
                }
                setIsLoading(false)
            }
            getData()
        }
    },[user])
    return {searched,isLoading,addLoading,handleSearch,handleAdd,handleEdit,handleDelete,handleChangePassword}
}