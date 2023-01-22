const AdminInfo = require('../models/adminInfo')
const SkilledInfo = require('../models/skilledInfo')
const Experience = require('../models/experience')
const Certificate = require('../models/skillCert')
const Skill = require('../models/skill')
const SkilledBill = require('../models/skilledBill')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')

//to generate json webtoken
const adminCreateToken = (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}

//ONLY ADMIN CAN ACCESS
//log in user
const adminLogIn = async(req, res) =>{
    const {username, password} = req.body
    try{
        //just call the function from the model
        const adminInfo = await AdminInfo.login(
            username, 
            password
        )

            //create token
            const token = adminCreateToken(adminInfo._id)
        res.status(200).json({username, adminInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//sign up user/create new admin
const adminSignUp = async(req, res) =>{
    const {
        username, 
        password,
        lname,
        fname,
        mname,
        contact,
        roleCapability
        } = req.body
        
    try{
        //just call the function from the model
        const adminInfo = await AdminInfo.signup(
            username, 
            password,
            lname,
            fname,
            mname,
            contact,
            roleCapability
        )

            //create token
            const token = adminCreateToken(adminInfo._id)
        res.status(200).json({adminInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get all admin
const adminGetAllAdmin = async(req, res)=>{

    try{
        //get all query
        const adminInfo = await AdminInfo.find({}).sort({createdAt: -1})
        .select("-password")
        .populate('roleCapabality')
        // .populate('adminRoleCapabality')
        // .populate({path: 'adminRoleCapabality',populate: {path:'roleCapability_id',populate:{path:'capability_id'}}})
        res.status(200).json(adminInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skilled
const adminGetOneAdmin = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const adminInfo = await AdminInfo.findById({_id: id})

    //check if not existing
    if (!adminInfo){
        return res.status(404).json({error: 'Admin not found'})
    }

    res.status(200).json(adminInfo)   

}

//update admin info username
const adminUpdateUserName = async(req, res) =>{
    const {id} = req.params 
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

         //check if email is existing
        const exists = await AdminInfo.findOne({username})
        if (exists){
            throw Error('Username already in use. Please enter a new unique username.')
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {username})

        //success
        res.status(200).json({adminInfo})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info pass
const adminUpdatePass = async(req, res) =>{
    const {id} = req.params 
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

        const admin_Info = await AdminInfo.findOne({username})
        if (!admin_Info){
            throw Error('Incorrect email.')
        }
        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, admin_Info.password)
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
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {password:hash})

        //success
        res.status(200).json(adminInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info
const adminUpdateInfo = async(req, res) =>{
    const {id} = req.params 
    try{
        
        //get info
        const {lname,
                fname,
                mname,
                contact,
                roleCapability} = req.body

        //validation
        if (!lname || !fname || !mname || !contact){
            throw Error('Please fill in all the blank fields.')
        }

        //update info
        const adminInfo = await AdminInfo.findOneAndUpdate(
            {_id:id},
            {lname,
            fname,
            mname,
            contact,
            roleCapability
        })

        //success
        res.status(200).json({messg: 'Successfully updated'})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//delete skilled info
const adminDeleteInfo = async(req, res) =>{
    const {id} = req.params 

    try{
        // const adminInfo = await AdminInfo.findByIdAndDelete(id)
        // res.status(200).json(adminInfo)
        const adminInfo = await AdminInfo.findById(id)
        if(adminInfo.isMainAdmin === 1){
           return res.status(400).json({error: "Cannot delete main admin account"})
        }
        await adminInfo.remove()
        res.status(200).json({ message: "Admin account deleted successfully"})
    }
    
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//DEPENDING ON THE ROLE OF THE ADMIN

//GET all skilled
const adminGetAllSkilled = async(req, res)=>{

    try{
        //get all query
        const skilledInfo = await SkilledInfo.find({}).sort({createdAt: -1})
        .select("-password")
        .populate('skills')
        .populate('experience')
        .populate('skillCert')
        .populate('skilledBill')
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skilled
const adminGetOneSkilled = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledInfo = await SkilledInfo.findById({_id: id})

    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)   

}

//UPDATE skilled
const adminUpdateSkilled = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const skilledInfo = await SkilledInfo.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)
}

//DELETE skilled
const adminDeleteSkilled = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledInfo = await SkilledInfo.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!skilledInfo){
        return res.status(404).json({error: 'Skilled Worker not found'})
    }

    res.status(200).json(skilledInfo)

}

//GET all skill exp
const adminGetAllExperience = async(req, res)=>{

    try{
        //get all query
        const experience = await Experience.find({}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(experience)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill cert
const adminGetAllCertificate = async(req, res)=>{

    try{
        //get all query
        const certificate = await Certificate.find({}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(certificate)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET all skill
const adminGetAllSkill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        //get all query
        const skill = await Skill.find({}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(skill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//GET all skill cert
const adminGetAllSkilledBill = async(req, res)=>{

    try{
        //get all query
        const skilledBill = await SkilledBill.find({}).sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(skilledBill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}
//update or edit address
const adminEditSkilledAddress = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {addIsVerified} = req.body
    const {id} = req.params 
    
    try{
        const skilledInfo = await SkilledInfo.findByIdAndUpdate(
        {_id:id},
    {
        $set:{
            "address.addIsVerified":addIsVerified
        }
    })
    res.status(200).json(skilledInfo)
    }catch(error){
        res.status(404).json({error: error.message})
    }
}

//UPDATE UPDATE BILL VERIFICATION
const adminUpdateBillVer = async(req, res) =>{
    try {
      const skilledBill = await SkilledBill.updateMany(
        { 
          // skilled_id: req.skilledInfo._id,
          billIssuedOn: { $lt: new Date() } 
        },
        { $set: { billIsVerified: 0 } }
      );
      res.json({ message: 'Bill Expired.', skilledBill });
    } catch (error) {
      res.status(500).json({ message: 'Error updating documents', error });
    }
}


module.exports = {
    adminLogIn,
    adminSignUp,
    adminGetAllAdmin,
    adminGetOneAdmin,
    adminUpdateUserName,
    adminUpdatePass,
    adminUpdateInfo,
    adminDeleteInfo,
    adminGetAllSkilled,
    adminGetOneSkilled,
    adminUpdateSkilled,
    adminDeleteSkilled,
    adminGetAllExperience,
    adminGetAllCertificate,
    adminGetAllSkill,
    adminGetAllSkilledBill,
    adminEditSkilledAddress,
    adminUpdateBillVer,
}