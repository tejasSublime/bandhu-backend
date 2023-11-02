import { userCollection, otpCollection } from "../collections.js";
import moment from "moment";
import { decrypt, encrypt } from "../helper/security.js";
import { validator } from "../helper/validate.js";
import bcrypt from 'bcrypt';
import { processImage } from "../helper/pickimage.js";
import { generateToken } from "../config/jwtConfig.js";




// signin user controller
export async function signin(req, res) {

    try {
        const { mobileNo, password } = req.body;

        const validationRule = {
            mobileNo: "required",
            password: "required",
        };
        // checking for all feilds
        const { err, status } = await new Promise((resolve) => {
            validator(req.body, validationRule, {}, (err, status) => {
                resolve({ err, status });
            });
        });

        // If there are validation errors, return an error response
        if (!status) {
            return res.status(500).send({
                success: false,
                message: "validation error",
                data: err.errors,
            });
        }
        let user = await userCollection.findOne(
            { mobileNo, status: 1 },
            { projection: { password: 0, createdOn: 0, modifyOn: 0, status: 0 } }
        );
        if (!user) {
            return res.status(200).json({ success: false, message: 'user not exist' });
        }
        const _password = await userCollection.findOne({ _id: user._id }, { projection: { password: 1 } });

        const isValidPassword = await bcrypt.compare(password, _password.password);

        if (!isValidPassword) {
            return res.status(200).json({ success: false, message: 'Invalid credentials' });
        }


        const token = await generateToken({
            id: user._id
        });
        return res.status(200).json({
            success: true,
            message: "user exist",

            data: { token, user },
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: error.message, data: error.data });

    }


}


// signup user controller

export async function signup(req, res) {
    try {

        const { mobileNo, password, name, email } = req.body;

        // check the body using validtor 
        const validationRule = {
            mobileNo: "required",
            password: "required",
            name: "required",
            email: "required",
        };

        const { err, status } = await new Promise((resolve) => {
            validator(req.body, validationRule, {}, (err, status) => {
                resolve({ err, status });
            });
        });

        // If there are validation errors, return an error response
        if (!status) {
            return res.status(200).json({ success: false, message: "Validation error", data: err.errors });
        }
        const existingUser = await userCollection.findOne({ mobileNo });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // inserting the user in the collection
        let results = await userCollection.insertOne({
            name,
            mobileNo,
            email,
            profileImage: "default.jpg",
            password: hashedPassword,
            createdOn: new Date(),
            modifyOn: new Date(),
            status: 1,
        });
        if (req.files != null) {
            const profileImage = await processImage(req, results.insertedId);
            await userCollection.updateOne({ _id: results.insertedId }, { $set: { profileImage } });
        }

        const _userData = await userCollection.findOne({ _id: results.insertedId }, { projection: { password: 0, createdOn: 0, modifyOn: 0, status: 0 } });
        const token = await generateToken({
            id: results.insertedId
        });
        return res.status(200).send({ success: true, data: { user: _userData, token }, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: error.message, data: error.data });

    }
};

export async function sendOtp(req, res) {
    try {
        const { mobileNo } = req.body;
        let validationRule = {
            mobileNo: "required",
        }

        let { err, status } = await new Promise((resolve) => {
            validator(req.body, validationRule, {}, (err, status) => {
                resolve({ err, status });
            });
        })
        if (!status) {
            return res.status(200).send({ success: false, message: "Validation error", data: err.errors });
        }


        const _userExist = await userCollection.findOne({ mobileNo });
        if (!_userExist) {
            return res.status(200).send({ success: false, message: "User not exist" });
        }

        const otpCode = Math.floor(1000 + Math.random() * 8999); // 4-digit otp
        const otpGenerated = new Date(); // get the generated time of the otp
        const otpValidTill = new Date(otpGenerated); // setting the valid time of the otp
        otpValidTill.setMinutes(otpGenerated.getMinutes() + 3); // this will set the otp valid till 30 mins
        const encryptedOtp = encrypt(otpCode.toString());

        const _data = {
            creationTime: otpGenerated,
            otpCode: encryptedOtp,
            mobileNo,
            validTill: otpValidTill,
            created_on: moment().format("YYYY-MM-DD HH:mm:ss"),
            modified_on: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        await otpCollection.updateOne(
            { mobileNo },
            { $set: _data },
            { upsert: true }
        );

        const bodySMS = `Welcome to Bandhu. ${otpCode} is the OTP to validate your mobile number. Do not share it with anyone. This OTP is only valid for 3 minutes from ${otpGenerated.toLocaleString()}`;

        return res.status(200).send({
            success: true,
            message: "OTP send successfully",
            data: bodySMS,
            otpCode: otpCode,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: error.message, data: error.data });
    }
}

export async function changePassword(req, res) {
    try {
        let { mobileNo, otpCode, password } = req.body;
        const validationRule = {
            otpCode: "required",
            mobileNo: "required",
            password: "required",
        }

        let { err, status } = await new Promise((resolve) => {
            validator(req.body, validationRule, {}, (err, status) => {
                resolve({ err, status });
            });
        })
        if (!status) {
            return res.status(400).send({ success: false, message: "Validation error", data: err.errors });
        }


        const otpData = await otpCollection.findOne({ mobileNo });

        if (decrypt(otpData.otpCode) != otpCode) {
            return res.status(400).send({ success: false, message: "Invalid OTP" });
        }
        await userCollection.updateOne({ mobileNo }, { $set: { password: await bcrypt.hash(password, 10) } });

        return res.status(200).send({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: error.message, data: error.data });
    }


}