const SkilledInfo = require('../models/skilledInfo')     
const AdminInfo = require('../models/adminInfo')    
const ClientInfo = require('../models/clientInfo')    
const SkilledBill = require('../models/skilledBill')
const Notification = require('../models/adminNotification')
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcrypt')
const validator = require('validator')
const otpGenerator = require('otp-generator')
const cloudinary = require("../utils/cloudinary")



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
            
            // Exclude 'otp' from the skilledInfo object
            const { otp, ...skilledInfoWithoutOTP } = skilledInfo.toObject();

        res.status(200).json({username, skilledInfo: skilledInfoWithoutOTP, token})
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
        regionAddr,
        } = req.body
        
    try{
        //check if password is not empty
        if (!req.body.retypePassword) {
            throw new Error('Please confirm your password.');
        }

         //check if password is match to retype password
        if (password!== req.body.retypePassword) {
            throw new Error('Passwords do not match.');
        }
        
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
            regionAddr,
            req.file
            )

            //create token
            const token = skilledCreateToken(skilledInfo._id)

            // Exclude 'otp' from the skilledInfo object
            const { otp, ...skilledInfoWithoutOTP } = skilledInfo.toObject();

            res.status(200).json({ skilledInfo: skilledInfoWithoutOTP, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get skilled info for update 
const getSkilledInfo = async(req, res) =>{

    try{
        const skilledInfo = await SkilledInfo.findById(req.skilledInfo._id)
        .select("-password -otp")
        .populate({
            path: "skills",
            match: { isDeleted: 0 },
            populate: {
              path: "skillName",
              select: "skill", // Assuming 'skill' is the field in 'AdminSkill' model that holds the skill name
            },
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
        if(username.length  <=5){
            throw Error('Please enter atleast 6 characters in username.')
        }

        //check if email is existing
        const adminExists = await AdminInfo.findOne({username})
        if (adminExists){
            throw Error('Username already in use.')
        }

        //check if email is existing
        const clientExists = await ClientInfo.findOne({username})
        if (clientExists){
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
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update skilled info pass
const updateSkilledPass = async(req, res) =>{
  
    try{
        
        //get info
        const {oldpass, newpass, retypePassword, username} = req.body
        
        //find first the accounts
        const skilled_Info = await SkilledInfo.findOne({username})
        if (!skilled_Info){
            throw Error('Incorrect username.')
        }

        //the user can updated password after 30 days
        // Calculate the time difference between passwordUpdated and the current date
        // const currentTime = new Date();
        // const passwordUpdatedTime = skilled_Info.passwordUpdated;

        // // Calculate the difference in milliseconds
        // const timeDifference = currentTime - passwordUpdatedTime;

        // // Calculate the difference in days
        // const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        // // Calculate the date when the user can update the password again
        // const nextUpdateDate = new Date(passwordUpdatedTime);
        // nextUpdateDate.setDate(nextUpdateDate.getDate() + 7);

        // // Allow password update only if 30 days have passed since passwordUpdated
        // if (daysDifference < 7) {
        //     // throw Error('You can update your password only after 30 days of the last update.');
        //     throw Error(`You can only update password after 7 days. Next update will be on ${nextUpdateDate.toDateString()}.`);
        // }


        //validation
        if (!oldpass || !newpass || !retypePassword|| !username){
            throw Error('Please enter all the blank fields.')
        }

        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, skilled_Info.password)
        //if not match
        if(!match){
            throw Error('Incorrect password.')
        }

        if (oldpass===newpass){
            throw Error('Please do not enter the same current and new password.')
        }


        //check if strong password
        if(newpass.length  <=5){
            throw Error('Please enter atleast 6 characters in password.')
        }

        if (newpass!==retypePassword){
            throw Error('Password confirmation is not matched.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const currentDate = new Date();//if greater than or equal to 30, update the passwordUpdated to the current date
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            {
                password:hash,
                passwordUpdated: currentDate
            })

        //success
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

const updateSkilledInfo = async(req, res) =>{
  
    try{
        
        //get info
        const {lname,
                fname,
                mname,
                contact} = req.body

        //validation
        if (!lname || !fname || !contact){
            throw Error('Please fill in all the blank fields.')
        }

        const skilledInfoCheck = await SkilledInfo.findOne({
            _id: { $ne: req.skilledInfo._id },
            fname: fname,
            mname: mname,
            lname: lname,
            contact: contact,
            isDeleted:{$in: [0, 1]}
        })
        if(skilledInfoCheck){
            // return res.status(400).json({error: "You have entered the same personal information, please try again."})
            const notification = await Notification.create({
                skilled_id: req.skilledInfo._id,
                message: `updated information has same information with the other skilled worker account.`,
                urlReact:`/SkilledWorker/Information`
            });
        }
        //check if valid contact no
        const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
        if (!mobileNumberRegex.test(contact)) {
            throw new Error('Please check your contact number.');
        }

        // Update info, including profile picture if provided
        let updateData = {
            lname,
            fname,
            mname,
            contact
        };

        if (req.file) {
            try {
                // Upload updated profile picture to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'profile_pictures', // Optional folder name in your Cloudinary account
                    use_filename: true,
                    unique_filename: false
                });

                updateData.profilePicture = result.secure_url;
            } catch (error) {
                throw new Error('Error uploading profile picture to Cloudinary.');
            }
        }

        //update info
        const skilledInfo = await SkilledInfo.findOneAndUpdate(
            {_id: req.skilledInfo._id},
            updateData,
            { new: true }
        )

        //success
        res.status(200).json({message: "Successfully updated."})
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
            regionAddr: regionAddr,
            skilled_id: req.skilledInfo._id
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
        req.app.locals.OTP = await otpGenerator.generate(8, {specialChars: false})

        const skilledInfoOTP = await SkilledInfo.findOneAndUpdate({ _id: req.skilledInfo._id },
            { addIsVerified: 0, otp: req.app.locals.OTP }
        );

        //create notification when verification is successful
        const skilledInfoNotif = await SkilledInfo.findOne({ _id: req.skilledInfo._id });
        const skilledUserName = skilledInfoNotif.username;
        const notification = await Notification.create({
            skilled_id: req.skilledInfo._id,
            message: `${skilledUserName} requested OTP.`,
            urlReact:`/SkilledWorker/Information`
        });
        //success
        res.status(200).json({message: "Successfully updated. Please verify your address again. OTP will be send via snailmail."})
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
        res.status(200).json({message: "Successfully deleted."})
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
        
        const skilledInfoNotif = await SkilledInfo
        .findOne({ _id: req.skilledInfo._id });
        const skilledUserName = skilledInfoNotif.username;
        const notification = await Notification.create({
            skilled_id: req.skilledInfo._id,
            message: `${skilledUserName} requested OTP.`,
            urlReact:`/SkilledWorker/Information`
        });

        res.status(200).json({ message: 'Request Sent. OTP will be send via snail mail.'})
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
        if (skilledOTP === "") {
            return res.status(400).json({ error: 'No OTP found. Please request for OTP.' })
        }
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

        return res.status(201).send({ message: 'Verified Successsfully!'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

const updateSkilledAccount = async (req, res) => {
    try {
        // Find the document by its _id
        const skilledInfo = await SkilledInfo
        .findById(req.skilledInfo._id)
        .populate('skillBarangay')
        .populate('skillNbi');
     
        if (skilledInfo) {
            // Check the values of idIsVerified, address.addIsVerified, and skilledBill
            if (skilledInfo.addIsVerified === 1 &&
                skilledInfo.skillBarangay.some(brgy => brgy.bClearanceIsVerified === "true") &&
                skilledInfo.skillNbi.some(nbi => nbi.nClearanceIsVerified === "true")) {
                const skilledInfoVerified = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 1 } }, { new: true });
                
                //exclude otp
                const { otp, ...skilledInfoWithoutOTP } = skilledInfoVerified.toObject();

                return res.status(200).json(skilledInfoWithoutOTP);
            } else if (skilledInfo.addIsVerified === 0 ||
                skilledInfo.skillBarangay.every(brgy => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                skilledInfo.skillNbi.every(nbi => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")) {
                const skilledInfoNotVerified = await SkilledInfo.findByIdAndUpdate(req.skilledInfo._id, { $set: { userIsVerified: 0 } }, { new: true });
                
                //exclude otp
                const { otp, ...skilledInfoWithoutOTP } = skilledInfoNotVerified.toObject();

                return res.status(200).json(skilledInfoWithoutOTP);
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