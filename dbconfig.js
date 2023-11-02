import { MongoClient } from "mongodb";

const uri =
    `mongodb+srv://tejassublimetechnocorp:pOBlzPSpHGSbbPHj@cluster0.tqip5mv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

let conn;
try {
    conn = await client.connect();
} catch (error) {
    console.error(error);
}

let db = conn.db("bandhu");

export default db;
