const SkilledInfo = require('../models/skilledInfo')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
// const multer = require('multer')
// const upload = multer({dest: '/uploads/'})//the folder destination of uploaded image


//to generate json webtoken
const skilledCreateToken = (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}

//log in user
const skilledLogIn = async(req, res) =>{
    const {username, password} = req.body
    try{
        //just call the function from the model
        const skilledInfo = await SkilledInfo.login(
            username, 
            password
        )

            //create token
            const token = skilledCreateToken(skilledInfo._id)
        res.status(200).json({username, skilledInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//sign up user
const skilledSignUp = async(req, res) =>{
    const {
        username, 
        password,
        lname,
        fname,
        mname,
        contact,
        address,
        brgyClearance,
        nbiClearance,
        bill
        } = req.body
        
    try{
        //just call the function from the model
        const skilledInfo = await SkilledInfo.signup(
            username, 
            password,
            lname,
            fname,
            mname,
            contact,
            address,
            brgyClearance,
            nbiClearance,
            bill
            )

            //create token
            const token = skilledCreateToken(skilledInfo._id)
        res.status(200).json({skilledInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get skilled info for update 
const getSkilledInfo = async(req, res) =>{

    try{
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id)
        .select("-password")
        .populate('skills')
        .populate('experience')
        .populate('skillCert')

        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update skilled info email
const updateSkilledUserName = async(req, res) =>{
  
    try{
        
        //get info
        const {username} = req.body

        //validation
        if (!username){
            throw Error('Please enter your new email.')
        }

        //check if strong password
        if(username.length <8){
            throw Error('Please enter atleast 8 characters in email.')
        }

         //check if email is existing
        const exists = await SkilledInfo.findOne({username})
        if (exists){
            throw Error('Email already in use. Please enter a new unique email.')
        }

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {username})

        //success
        res.status(200).json({skilledInfo})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info pass
const updateSkilledPass = async(req, res) =>{
  
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

        const skilled_Info = await SkilledInfo.findOne({username})
        if (!skilled_Info){
            throw Error('Incorrect email.')
        }
        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, skilled_Info.password)
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
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {password:hash})

        //success
        res.status(200).json(skilledInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info
const updateSkilledInfo = async(req, res) =>{
  
    try{
        
        //get info
        const {lname,
                fname,
                mname,
                contact,
                brgyClearance,
                nbiClearance} = req.body

        //validation
        if (!lname || !fname || !mname || !contact || !brgyClearance  || !nbiClearance ){
            throw Error('Please fill in all the blank fields.')
        }

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {lname,
            fname,
            mname,
            contact,
            brgyClearance,
            nbiClearance
        })

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update or edit address
const editAddress = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {houseNo, street, barangay, city, prov} = req.body
    
    try{
        const skilledInfo = await SkilledInfo.findByIdAndUpdate(
        {_id: req.skilledInfo._id},
    {
        $set:{
            "address.houseNo":houseNo,
            "address.street":street,
            "address.barangay":barangay,
            "address.city":city,
            "address.prov":prov
        }
    })
    res.status(200).json(skilledInfo)
    }catch(error){
        res.status(404).json({error: error.message})
    }
}

//update or edit bclearance
const editBill = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {billPhoto, billIssuedOn} = req.body
    
    try{
        const skilledInfo = await SkilledInfo.findByIdAndUpdate(
        {_id: req.skilledInfo._id},
    {
        $set:{
            "bill.billPhoto":billPhoto,
            "bill.billIssuedOn":billIssuedOn
        }
    })
    res.status(200).json(skilledInfo)
    }catch(error){
        res.status(404).json({error: error.message})
    }

}

//delete skilled info
const deleteSkilledInfo = async(req, res) =>{

    try{
        const skilledInfo = await SkilledInfo.findByIdAndDelete(req.skilledInfo._id)
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//push address
const pushAddress = async(req,res) =>{
    try{
        const {address} = req.body

        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id:req.skilledInfo._id},
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
    
    const address = await SkilledInfo.updateOne({
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
    
    const address = await SkilledInfo.updateOne(
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
        const {contactNo} = req.body

        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id:req.skilledInfo._id},
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
    
    const contact = await SkilledInfo.updateOne({
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
    
    const contact = await SkilledInfo.updateOne(
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
    skilledLogIn,
    skilledSignUp,
    getSkilledInfo,
    updateSkilledUserName,
    updateSkilledPass,
    updateSkilledInfo,
    editAddress,
    editBill,
    deleteSkilledInfo,
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
}