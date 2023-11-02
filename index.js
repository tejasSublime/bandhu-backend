import express from "express";
import dotenv from "dotenv";
import userRoute from "./src/routes/user.js";
import authRoute from "./src/routes/login.js";
import cors from "cors";
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

dotenv.config(); // added .env data
const app = express();
const port = 3000;
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cors())
app.use(express.static("public"));
app.use(express.json({ limit: '100mb' })); F




app.use("/api/v1/user", userRoute); // user route binding
app.use("/api/v1/auth", authRoute); // auth route binding




app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.removeHeader("X-Powered-By");
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.locals.message = err.message;
    // console.log('Error MSG : : ',err.message);
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send({ success: false, message: "Api Not Found", data: [] });
});

// this is the port listner
app.listen(port, () => {
    console.log(`Bandhu backend is listening on port ${port}`);
});