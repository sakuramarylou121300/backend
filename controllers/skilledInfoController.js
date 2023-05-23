const SkilledInfo = require('../models/skilledInfo')     
const AdminInfo = require('../models/adminInfo')    
const SkilledBill = require('../models/skilledBill')
const Notification = require('../models/adminNotification')
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcrypt')
const validator = require('validator')
const otpGenerator = require('otp-generator')

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
        houseNo,
        street,
        barangayAddr,
        cityAddr,
        provinceAddr,
        regionAddr
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
            houseNo,
            street,
            barangayAddr,
            cityAddr,
            provinceAddr,
            regionAddr
            )

            //create token
            const token = skilledCreateToken(skilledInfo._id)
        res.status(200).json({skilledInfo, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

// //skilledIsVerifiedOrNot
// const verifiedSkilled = async(req, res) =>{ 
//     try {
//         // Find the document by its _id
//         const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id)
//         .populate('skillBarangay')
//         .populate('skillNbi');
//         if (skilledInfo) {
//             // Check the values of idIsVerified, address.addIsVerified, and skilledBill
//             if (skilledInfo.skillBarangay.some(barangay => barangay.bClearanceIsVerified === 1) &&
//                 skilledInfo.skillNbi.some(nbi => nbi.nClearanceIsVerified === 1)) {
//                 // Update the userIsVerified field to 1
//                 const updatedSkilledInfo = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, 
//                     { $set: { userIsVerified: 1 } }, { new: true });
//                 return res.status(200).json(updatedSkilledInfo);
//             } 
//             else if (
//                 !skilledInfo.skillBarangay.some(barangay => barangay.bClearanceIsVerified === 1) &&
//                 !skilledInfo.skillNbi.some(nbi => nbi.nClearanceIsVerified === 1)) {
//            // Update the userIsVerified field to 0
//            const updatedSkilledInfo = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, 
//                { $set: { userIsVerified: 0 } }, { new: true });
//            return res.status(200).json(updatedSkilledInfo);
//        }
//             // else {
//             //     return res.status(200).json({ message: "Please check your id, address and your bill if they are verified." });
//             // }
//         } else {
//             return res.status(404).json({ message: "SkilledInfo not found" });
//         }   
//     } catch (err) {
//         return res.status(500).json({ message: err.toString() });
//     }
// }

//get skilled info for update 
const getSkilledInfo = async(req, res) =>{

    try{
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id)
        .select("-password")
        .populate({
            path: 'skills',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillExp',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillCert',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillBarangay',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'skillNbi',
            match: { isDeleted: 0} 
        })
        
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
            throw Error('Please enter your username.')
        }

        //check if strong password
        if(username.length <8){
            throw Error('Please enter atleast 8 characters in username.')
        }

         //check if email is existing
        const adminExists = await AdminInfo.findOne({username})
        if (adminExists){
            throw Error('Username already in use.')
        }

        const exists = await SkilledInfo.findOne({username})
        if (exists){
            throw Error('Username already in use.')
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
                houseNo,
                street,
                barangayAddr,
                cityAddr,
                provinceAddr,
                regionAddr} = req.body

        //validation
        if (!lname || !fname || !contact ||  
            !houseNo || !street || !barangayAddr || !cityAddr ||
            !provinceAddr || !regionAddr){
            throw Error('Please fill in all the blank fields.')
        }
        const skilledInfoCheck = await SkilledInfo.findOne({
            fname: fname,
            mname: mname,
            lname: lname,
            contact: contact,
            houseNo: houseNo,
            street: street,
            barangayAddr: barangayAddr,
            cityAddr: cityAddr,
            provinceAddr: provinceAddr,
            regionAddr: regionAddr,
            isDeleted:{$in: [0, 1]}
        })
        
        if(skilledInfoCheck){
            return res.status(400).json({error: "You have entered the same personal information, please try again."})
        }
        //check if valid contact no
        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
        if (!mobileNumberRegex.test(contact)) {
            throw new Error('Please check your contact number.');
        }

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {lname,
            fname,
            mname,
            contact,
            houseNo,
            street,
            barangayAddr,
            cityAddr,
            provinceAddr,
            regionAddr
        })

        //success
        res.status(200).json(skilledInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

const updateSkilledAddress = async(req, res) =>{
  
    try{
        
        //get info
        const {houseNo,
                street,
                barangayAddr,
                cityAddr,
                provinceAddr,
                regionAddr} = req.body

        //validation
        if (!street || !barangayAddr || !cityAddr ||
            !provinceAddr || !regionAddr){
            throw Error('Please fill in all the blank fields.')
        }
        const skilledInfoCheck = await SkilledInfo.findOne({
            houseNo: houseNo,
            street: street,
            barangayAddr: barangayAddr,
            cityAddr: cityAddr,
            provinceAddr: provinceAddr,
            regionAddr: regionAddr
        })
        
        if(skilledInfoCheck){
            return res.status(400).json({error: "You have entered the same address, please try again."})
        }

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {houseNo,
            street,
            barangayAddr,
            cityAddr,
            provinceAddr,
            regionAddr,
            addIsVerified:0
        })

        //success
        res.status(200).json(skilledInfo)
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//delete skilled info
const deleteSkilledInfo = async(req, res) =>{

    try{
        const skilledInfo = await SkilledInfo.findOneAndUpdate({_id: req.skilledInfo._id},
            {isDeleted:1})
        res.status(200).json(skilledInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

const generateOTP = async(req, res) =>{

    try{
        req.app.locals.OTP = await otpGenerator.generate(8, {specialChars: false})

        const skilledInfo = await SkilledInfo.findOneAndUpdate({ _id: req.skilledInfo._id },
            { addIsVerified: 0, otp: req.app.locals.OTP }
        );
        res.status(200).json({ message: 'Request Sent.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

const verifyOTP = async(req, res) =>{

    try{
        const {otp} = req.body
       
        const skilledFindOTP = await SkilledInfo.findOne({ _id: req.skilledInfo._id })
        skilledOTP = skilledFindOTP.otp
        if (otp !== skilledOTP) {

            const otpReset = await SkilledInfo.findOneAndUpdate(
                { _id: req.skilledInfo._id }, { otp:""}
            );
            return res.status(400).json({ error: 'Invalid OTP, please request again.' })
        }
    
        //if verified then addIsVerified:1 or address is verified now
        const skilledInfo = await SkilledInfo.findOneAndUpdate({ _id: req.skilledInfo._id },
            { addIsVerified: 1, otp:""}
        );
        //create notification when verification is successful
        const skilledInfoNotif = await SkilledInfo.findOne({ _id: req.skilledInfo._id });
        const skilledUserName = skilledInfoNotif.username;
        const notification = await Notification.create({
            skilled_id: req.skilledInfo._id,
            message: `${skilledUserName} has requested OTP to verify address.`,
            urlReact:`/temporary/${skilledUserName}`
        });

        return res.status(201).send({ message: 'Verified Successsfully!'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

const updateSkilledAccount = async (req, res) => {
    try {
        // Find the document by its _id
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id)
        .populate('skillBarangay')
        .populate('skillNbi');
     
        if (skilledInfo) {
            // Check the values of idIsVerified, address.addIsVerified, and skilledBill
            if (skilledInfo.addIsVerified === 1 &&
                skilledInfo.skillBarangay.some(brgy => brgy.bClearanceIsVerified === "true") &&
                skilledInfo.skillNbi.some(nbi => nbi.nClearanceIsVerified === "true")) {
                const skilledInfoVerified = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 1 } }, { new: true });
                return res.status(200).json(skilledInfoVerified);
            } else if (skilledInfo.addIsVerified === 0 ||
                skilledInfo.skillBarangay.some(brgy => brgy.bClearanceIsVerified === "true") ||
                skilledInfo.skillNbi.some(nbi => nbi.nClearanceIsVerified === "true")) {
                const skilledInfoNotVerified = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 0 } }, { new: true });
                return res.status(200).json(skilledInfoNotVerified);
            }
        } else {
            return res.status(404).json({ message: "Skilled worker not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

//NOT SURE IF INCLUDED
//update or edit address
const editAddress = async(req,res) =>{
    // const arrayId = req.params.arrayId;
    const {houseNo, street, barangayAddr, cityAddr, provinceAddr} = req.body
    
    try{
        const skilledInfo = await SkilledInfo.findByIdAndUpdate(
        {_id: req.skilledInfo._id},
    {
        $set:{
            "address.houseNo":houseNo,
            "address.street":street,
            "address.barangayAddr":barangayAddr,
            "address.cityAddr":cityAddr,
            "address.provinceAddr":provinceAddr
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
//USER ACCOUNT VERFICATION
//UDPATE SKILLED WORKER USER IS VERIFIED
const skilledUpdateSkilledAccount = async(req, res) =>{ 
    try {
        // Find the document by its _id
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id).populate('skilledBill');
        if (skilledInfo) {
            // Check the values of idIsVerified, address.addIsVerified, and skilledBill
            if (skilledInfo.idIsVerified === 1 &&
                skilledInfo.address.addIsVerified === 1 &&
                skilledInfo.skilledBill.some(bill => bill.billIsVerified === 1)) {
                // Update the userIsVerified field to 1
                const updatedSkilledInfo = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 1 } }, { new: true });
                return res.status(200).json(updatedSkilledInfo);
            } else {
                return res.status(200).json({ message: "Please check your id, address and your bill if they are verified." });
            }
        } else {
            return res.status(404).json({ message: "SkilledInfo not found" });
        }   
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
}

const skilledUpdateNotVerifiedUsers = async (req, res) => {
    try {
        // Find the document by its _id
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id).populate('skilledBill');
        if (skilledInfo) {
            // Check the values of idIsVerified, address.addIsVerified, and skilledBill
            if (skilledInfo.idIsVerified === 0 ||
                skilledInfo.address.addIsVerified === 0 ||
                (skilledInfo.skilledBill && 
                !skilledInfo.skilledBill.some(bill => bill.billIsVerified === 1))) {
                // Update the userIsVerified field to 0
                const updatedSkilledInfo = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 0 } }, { new: true });
                return res.status(200).json({ message: "Please check your barangayAddr clearance, nbi clearance, address and bill if they are verified" });
            } 
        } else {
            return res.status(404).json({ message: "SkilledInfo not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

//UPDATE UPDATE BILL VERIFICATION
const skilledUpdateBill = async(req, res) =>{
    try {
        var currentDate = new Date();
        const skilledBill = await SkilledBill.updateMany({ billDueDate: {$lt:currentDate}, billIsVerified: 1 }, 
            {$set: 
                { billIsVerified: 0, billMessage: "Please pay your bill" } });
        
                return res.status(200).json(skilledBill);
                // console.log(skilledBill) 
    } catch (error) {
      res.status(500).json({ message: 'Error updating documents', error });
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
    const {houseNo, street, barangayAddr, cityAddr, provinceAddr} = req.body
    
    const address = await SkilledInfo.updateOne({
        "address._id":arrayId
    },
    {
        $set:{
            "address.$.houseNo":houseNo,
            "address.$.street":street,
            "address.$.barangayAddr":barangayAddr,
            "address.$.cityAddr":cityAddr,
            "address.$.provinceAddr":provinceAddr
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
    updateSkilledAddress,
    editAddress,
    editBill,
    deleteSkilledInfo,
    generateOTP,
    verifyOTP,
    skilledUpdateSkilledAccount,
    skilledUpdateNotVerifiedUsers,
    skilledUpdateBill,
    updateSkilledAccount,
    pushAddress,
    updateAddress,
    pullAddress,
    pushContact,
    updateContact,
    pullContact
}