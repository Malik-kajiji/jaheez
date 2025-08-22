const adminModel = require('../../models/admin')

const createAdmin = async (req,res) => {
    const { username,password,access } = req.body
    try {
        const admin = await adminModel.createAdmin(username,password,access)
        res.status(200).json(admin)
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const deleteAdmin = async (req,res) => {
    const { _id } = req.body
    try {

        const admin = await adminModel.deleteAdmin(_id)
        res.status(200).json(admin)
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const editAccess = async (req,res) => {
    const { _id,access } = req.body

    try {
        const admin = await adminModel.editAccess(_id,access)
        res.status(200).json(admin)
    }catch(err){
        res.status(400).json({message:json.message})
    }
}

const changePassword = async (req,res) => {
    const { _id,password } = req.body
    try {
        const admin = await adminModel.changePassword(_id,password)
        res.status(200).json(admin)
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

const getAllAdmins = async (req,res) => {
    try {
        const admins = await adminModel.getAllAdmins()
        res.status(200).json(admins)
    }catch(err){
        res.status(400).json({message:err.message});
    }
}


module.exports = {
    createAdmin,
    deleteAdmin,
    editAccess,
    changePassword,
    getAllAdmins,
}