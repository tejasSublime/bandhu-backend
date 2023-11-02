import jwt from "jsonwebtoken";
import { encrypt, decrypt, generateHash } from "../helper/security.js";

// verify jwt auth token function
export async function verifyToken(req, res, next) {
    const token =
        req.body.token || req.headers["x-access-token"] || req.query.token;
    if (!token) {
        return res.status(403).send({
            message: "A Token is Required for Authentication",
            success: false,
            data: {},
        });
    }
    try {
        const _decryptToken = decrypt(token);
        let decodedData = jwt.verify(_decryptToken, process.env.JWT_TOKEN || "");
        if (typeof decodedData !== "object") {
            decodedData = {};
        }
        delete decodedData.iat;
        delete decodedData.exp;
        delete decodedData.nbf;
        delete decodedData.jti;
        req.body = { ...req.body, decodedData };
    } catch (error) {
        console.log(error.message);
        return res
            .status(401)
            .send({ message: "Invalid Token", success: false, data: {} });
    }
    return next();
}

// generate jwt auth token function
export async function generateToken(data) {
    data.iat = Date.now();
    const token = jwt.sign({ data }, process.env.JWT_TOKEN || "", {
        expiresIn: "30d",
    });
    return encrypt(token);
}

// export function generateRandomToken(length) {
//     const characters =
//         "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let token = "";

//     for (let i = 0; i < length; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         token += characters.charAt(randomIndex);
//     }

//     return token;
// }
