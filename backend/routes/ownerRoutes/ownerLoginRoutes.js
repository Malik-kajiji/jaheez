const express = require('express')
const router = express.Router()

const {
    loginAsOwner
} = require('../../controllers/ownerControllers/ownerLogin')

router.post('/login',loginAsOwner)

module.exports = router