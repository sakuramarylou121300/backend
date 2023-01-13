const express = require('express')
const {
    createAddress, 
    getAllAddress,
    getOneAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/clientAddressController')
const clientRequireAuth = require('../middleware/clientRequireAuth')

//instance of router
router = express.Router()

router.use(clientRequireAuth)

//POST address
router.post('/post/', createAddress)

//GET address
router.get('/get/', getAllAddress)

//GET single address
router.get('/getOne/:id', getOneAddress)

//UPDATE single address
router.patch('/update/:id', updateAddress)

//DELETE contact
router.delete('/delete/:id', deleteAddress)

//export
module.exports = router