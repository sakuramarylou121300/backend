const ClientInfo = require('../models/clientInfo')
const AdminInfo = require('../models/adminInfo')    
const SkilledInfo = require('../models/skilledInfo')  
const AdminSkill = require('../models/adminSkill')  
const Notification = require('../models/adminNotification')    
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
const otpGenerator = require('otp-generator')
const cloudinary = require("../utils/cloudinary")

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
            
            // Exclude 'otp' from the skilledInfo object
            const { otp, ...clientWithoutOTP } = clientInfo.toObject();

            res.status(200).json({username, clientInfo:clientWithoutOTP, token})
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
        const clientInfo = await ClientInfo.signup(
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
            const token = clientCreateToken(clientInfo._id)
            
            // Exclude 'otp' from the skilledInfo object
            const { otp, ...clientInfoWithoutOTP } = clientInfo.toObject();

            res.status(200).json({username, clientInfo:clientInfoWithoutOTP, token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//get client info for update 
const getClientInfo = async(req, res) =>{

    try{
        const clientInfo = await ClientInfo.findById(req.clientInfo._id)
        .select("-password -otp")
        .populate({
            path: 'clientBarangay',
            match: { isDeleted: 0} 
        })
        .populate({
            path: 'clientNbi',
            match: { isDeleted: 0} 
        })
        res.status(200).json(clientInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update client info username
const updateClientUsername = async(req, res) =>{
  
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

         //check if username is existing
        const exists = await ClientInfo.findOne({username})
        if (exists){
            throw Error('Username already in use.')
        }
        const adminExists = await AdminInfo.findOne({username})
        if (adminExists){
            throw Error('Username already in use.')
        }
        const skilledExists = await SkilledInfo.findOne({username})
        if (skilledExists){
            throw Error('Username already in use.')
        }

        //update info
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {username})

        //success
        res.status(200).json({message: "Successfully updated."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}

//update client info pass
const updateClientPass = async(req, res) =>{
  
    try{
        
        //get info
        const {oldpass, newpass, retypePassword, username} = req.body

        //find the user first
        const client_Info = await ClientInfo.findOne({username})
        if (!client_Info){
            throw Error('Incorrect username.')
        }

        //the user can updated password after 30 days
        // Calculate the time difference between passwordUpdated and the current date
        // const currentTime = new Date();
        // const passwordUpdatedTime = client_Info.passwordUpdated;

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
        //     throw Error(`You can only update password after 7 days of your last update. Next update will be on ${nextUpdateDate.toDateString()}.`);
        // }

        //validation
        if (!oldpass || !newpass || !retypePassword || !username){
            throw Error('Please enter all blank fields.')
        }

        //check if the password and password hash in match
        const match = await bcrypt.compare(oldpass, client_Info.password)
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

        //check confirmation of password
        if (newpass!==retypePassword){
            throw Error('Password confirmation is not matched.')
        }

        //salt for additional security of the system
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newpass, salt)

        //update info
        const currentDate = new Date();//if greater than or equal to 30, update the passwordUpdated to the current date
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {   
                password:hash,
                passwordUpdated: currentDate})

        //success
        res.status(200).json({message: "Successfully updated."})
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
                mname,
                contact} = req.body

        //validation
        if (!lname || !fname || !contact){
            throw Error('Please fill in all the blank fields.')
        }

        const clientInfoCheck = await ClientInfo.findOne({
            _id: { $ne: req.clientInfo._id },
            fname: fname,
            mname: mname,
            lname: lname,
            contact: contact,
            isDeleted:{$in: [0, 1]}
        })
        if(clientInfoCheck){
            // return res.status(400).json({error: "You have entered the same personal information, please try again."})
            const notification = await Notification.create({
                client_id: req.clientInfo._id,
                message: `updated information has same information with the other client account.`,
                urlReact:`/Client/Information`
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
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
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
//delete acc
const deleteClientInfo = async(req, res) =>{

    try{
        const clientInfo = await ClientInfo.findByIdAndDelete(req.clientInfo._id)
        res.status(200).json(clientInfo)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const updateClientAddress = async(req, res) =>{
  
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
        const clientInfoCheck = await ClientInfo.findOne({
            houseNo: houseNo,
            street: street,
            barangayAddr: barangayAddr,
            cityAddr: cityAddr,
            provinceAddr: provinceAddr,
            regionAddr: regionAddr,
            client_id: req.clientInfo._id
        })
        
        if(clientInfoCheck){
            return res.status(400).json({error: "You have entered the same address, please try again."})
        }

        //update info
        const clientInfo = await ClientInfo.findOneAndUpdate(
            {_id: req.clientInfo._id},
            {houseNo,
            street,
            barangayAddr,
            cityAddr,
            provinceAddr,
            regionAddr,
            addIsVerified:0
        })

        req.app.locals.OTP = await otpGenerator.generate(8, {specialChars: false})

        const clientInfoAdd = await ClientInfo.findOneAndUpdate({ _id: req.clientInfo._id },
            { addIsVerified: 0, otp: req.app.locals.OTP }
        );

        //create notification when verification is successful
        const clientInfoNotif = await ClientInfo.findOne({ _id: req.clientInfo._id });
        const clientUserName = clientInfoNotif.username;
        const notification = await Notification.create({
            client_id: req.clientInfo._id,
            message: `${clientUserName} requested OTP.`,
            urlReact:`/Client/Information`
        });
        //success
        res.status(200).json({message: "Successfully updated. Please verify your address again. OTP will be send via snailmail."})
    }
    catch(error){

        res.status(400).json({error:error.message})
    }
}
const generateOTP = async(req, res) =>{

    try{
        req.app.locals.OTP = await otpGenerator.generate(8, {specialChars: false})

        const clientInfo = await ClientInfo.findOneAndUpdate({ _id: req.clientInfo._id },
            { addIsVerified: 0, otp: req.app.locals.OTP }
        );
        
        //create notification when verification is successful
        const clientInfoNotif = await ClientInfo.findOne({ _id: req.clientInfo._id });
        const clientUserName = clientInfoNotif.username;
        const notification = await Notification.create({
            client_id: req.clientInfo._id,
            message: `${clientUserName} requested OTP.`,
            urlReact:`/Client/Information`
        });

        res.status(200).json({ message: 'Request Sent. Your requested OTP will be send via snail mail.'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}
const verifyOTP = async(req, res) =>{

    try{
        const {otp} = req.body
       
        const clientFindOTP = await ClientInfo.findOne({ _id: req.clientInfo._id })
        clientOTP = clientFindOTP.otp
        if (clientOTP === "") {
            return res.status(400).json({ error: 'No OTP found. Please request for OTP.' })
        }
        if (otp !== clientOTP) {

            const otpReset = await ClientInfo.findOneAndUpdate(
                { _id: req.clientInfo._id }, { otp:""}
            );
            return res.status(400).json({ error: 'Invalid OTP, please request again.' })
        }
    
        //if verified then addIsVerified:1 or address is verified now
        const clientInfo = await ClientInfo.findOneAndUpdate({ _id: req.clientInfo._id },
            { addIsVerified: 1, otp:""}
        );

        return res.status(201).send({ message: 'Verified Successsfully!'})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

const updateClientAccount = async (req, res) => {
    try {
        // Find the document by its _id
        const clientInfo = await ClientInfo
        .findById(req.clientInfo._id)
        .populate('clientBarangay')
        .populate('clientNbi');
     
        if (clientInfo) {
            // Check the values of idIsVerified, address.addIsVerified, and skilledBill
            if (clientInfo.addIsVerified === 1 &&
                clientInfo.clientBarangay.some(brgy => brgy.bClearanceIsVerified === "true") &&
                clientInfo.clientNbi.some(nbi => nbi.nClearanceIsVerified === "true")) {
                const clientInfoVerified = await ClientInfo.findByIdAndUpdate(req.clientInfo._id, { $set: { userIsVerified: 1 } }, { new: true });
                
                //exclude otp
                const { otp, ...clientWithoutOTP } = clientInfoVerified.toObject();

                return res.status(200).json(clientWithoutOTP);

            } else if (clientInfo.addIsVerified === 0 ||
                clientInfo.clientBarangay.every(brgy => brgy.bClearanceIsVerified === "false" || brgy.bClearanceIsVerified === "pending") ||
                clientInfo.clientNbi.every(nbi => nbi.nClearanceIsVerified === "false" || nbi.nClearanceIsVerified === "pending")) {
                const clientInfoNotVerified = await ClientInfo.findByIdAndUpdate(req.clientInfo._id, { $set: { userIsVerified: 0 } }, { new: true });
                
                //exclude otp
                const { otp, ...clientWithoutOTP } = clientInfoNotVerified.toObject();

                return res.status(200).json(clientWithoutOTP);
            }
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

module.exports = {
    clientLogIn,
    clientSignUp,
    getClientInfo,
    updateClientUsername,
    updateClientPass,
    updateClientInfo,
    deleteClientInfo,
    updateClientAddress,
    generateOTP,
    verifyOTP,
    updateClientAccount
}