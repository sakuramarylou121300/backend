const ClientInfo = require('../models/clientInfo')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')

//to generate json webtoken
const clientCreateToken = (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}

//log in user
const clientLogIn = async(req, res) =>{
    const {username, password} = req.body
    try{
        //just call the function from the model
        const clientInfo = await ClientInfo.login(
            username, 
            password
        )

            //create token
            const token = clientCreateToken(clientInfo._id)
        res.status(200).json({username, clientInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//sign up user
const clientSignUp = async(req, res) =>{
    const {
        username, 
        password, 
        lname, 
        fname, 
        mname,
        contact,
        address} = req.body
    try{
        //just call the function from the model
        const clientInfo = await ClientInfo.signup(
            username, 
            password, 
            lname, 
            fname, 
            mname,
            contact,
            address
        )

            //create token
            const token = clientCreateToken(clientInfo._id)
        res.status(200).json({username, clientInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get client info for update 
const getClientInfo = async(req, res) =>{

    try{
        const clientInfo = await ClientInfo.findById(req.clientInfo._id)
        .select("-password")
        .populate('contacts')
        .populate('location')

        res.status(200).json(clientInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update client info username
const updateClientusername = async(req, res) =>{
  
    try{
        
        //get info
        const {username} = req.body

        //validation
        if (!username){
            throw Error('Please enter your new username.')
        }

        //check if strong password
        if(username.length <8){
            throw Error('Please enter atleast 8 characters in username.')
        }

         //check if username is existing
        const exists = await ClientInfo.findOne({username})
        if (exists){
            throw Error('username already in use. Please enter a new unique username.')
        }

        //update info
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {username})

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update client info pass
const updateClientPass = async(req, res) =>{
  
    try{
        
        //get info
        const {oldpass, newpass, username} = req.body

        //validation
        if (!oldpass || !newpass || !username){
            throw Error('Please enter all blank fields.')
        }

        if (oldpass===newpass){
            throw Error('Please do not enter the same current and new password.')
        }

        const client_Info = await ClientInfo.findOne({username})
        if (!client_Info){
            throw Error('Incorrect username.')
        }
        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, client_Info.password)
        //if not match
        if(!match){
            throw Error('Incorrect password.')
        }

        //check if strong password
        if(newpass.length <8){
            throw Error('Please enter atleast 8 characters in password.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {password:hash})

        //success
        res.status(200).json({messg: 'Successfully updated.'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update client info
const updateClientInfo = async(req, res) =>{
  
    try{
        
        //get info
        const {lname,
                fname,
                mname} = req.body

        //validation
        if (!lname || !fname || !mname){
            throw Error('Please fill in all the blank fields.')
        }

        //update info
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {lname,
            fname,
            mname})

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//delete acc
const deleteClientInfo = async(req, res) =>{

    try{
        const clientInfo = await ClientInfo.findByIdAndDelete(req.clientInfo._id)
        res.status(200).json({messg: 'Successfully deleted'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//push address
const pushAddress = async(req,res) =>{
    try{
        const {address} = req.body

        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id:req.clientInfo._id},
            {$push:{
                address
            }}
        )
        res.status(200).json({messg: 'Successfully added.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update or edit address
const updateAddress = async(req,res) =>{
    const arrayId = req.params.arrayId;
    const {houseNo, street, barangay, city, province} = req.body
    
    const address = await ClientInfo.updateOne({
        "address._id":arrayId
    },
    {
        $set:{
            "address.$.houseNo":houseNo,
            "address.$.street":street,
            "address.$.barangay":barangay,
            "address.$.city":city,
            "address.$.province":province
        }
    })

    if(address){
        res.send('Successfully updated.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}

//pull address
const pullAddress = async(req,res) =>{
    const arrayId = req.params.arrayId;
    
    const address = await ClientInfo.updateOne(
    {
        "address._id":arrayId
    },
    {
        $pull:{
            address:{_id:arrayId}
        }
    })

    if(address){
        res.send('Successfully deleted.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}

//push contact
const pushContact = async(req,res) =>{
    try{
        const {contact} = req.body

        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id:req.clientInfo._id},
            {$push:{
                contact
            }}
        )
        res.status(200).json({messg: 'Successfully added.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update or edit contact
const updateContact = async(req,res) =>{
    const arrayId = req.params.arrayId;
    const {contactNo} = req.body
    
    const contact = await ClientInfo.updateOne({
        "contact._id":arrayId
    },
    {
        $set:{
            "contact.$.contactNo":contactNo
        }
    })

    if(contact){
        res.send('Successfully updated.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}

//pull contact
const pullContact = async(req,res) =>{
    const arrayId = req.params.arrayId;
    
    const contact = await ClientInfo.updateOne(
    {
        "contact._id":arrayId
    },
    {
        $pull:{
            contact:{_id:arrayId}
        }
    })

    if(contact){
        res.send('Successfully deleted.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}
module.exports = {
    clientLogIn,
    clientSignUp,
    getClientInfo,
    updateClientusername,
    updateClientPass,
    updateClientInfo,
    deleteClientInfo,
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
}