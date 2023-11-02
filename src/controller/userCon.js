import { ObjectId } from "mongodb";
import { userCollection } from "../collections.js";




// Create User Controller
export async function getUserData(req, res) {
    try {
        const id = req.body.decodedData.data.id;

        let user = await userCollection.findOne(
            { _id: new ObjectId(id), status: 1 },
            { projection: { password: 0, createdOn: 0, modifyOn: 0, status: 0 } }
        );
        return res.status(200).send({
            message: "user is created successfully",
            success: true,
            data: user,
        });

        // returing the status and data results with user Id
    } catch (error) {
        console.log(error);
        // If error occurs, return 500 status and error message
        return res
            .status(500)
            .send({ message: "error", success: false, data: error });
    }
}

// Update User Controller
export async function updateUser(req, res) {
    try {
        // Get the data from the request body
        let { id, userName, emailId, city } = req.body;
        // Check if all required fields are provided
        if (!id || !userName || !emailId || !city) {
            return res.status(400).send({
                message: "All fields are required",
                success: false,
                data: {},
            });
        }

        let result = await userCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { userName, emailId, city } },
            { returnOriginal: true }
        );
        // return the respones with the updated user

        return res
            .status(200)
            .send({ message: "success", success: true, data: result });
    } catch (error) {
        // If error occurs, return 500 status and error message
        return res.status(500).send(error);
    }
}

// Delete User Controller
export async function deleteUser(req, res) {
    try {
        // Get the id from the query parameter
        let { id } = req.query;

        // Find the user by id and update the status to 2 which means the user is soft deleted
        let results = await userCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status: 2 } },
            { returnOriginal: false }
        );

        // Log the updated user
        console.log(results);

        // If user not found, return 404 status and error message
        if (!results) {
            return res.status(400).send({ message: "User not found" });
        }

        return (
            // Return success status and updated user data
            res.status(200).send({ message: "success", success: true, data: results })
        );
    } catch (error) {
        // If error occurs, return 500 status and error message
        console.log(error);
        return res
            .status(500)
            .send({ message: "error", success: false, data: error });
    }
}