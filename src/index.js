// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/db.js";
dotenv.config({
  path: "./env",
});

connectDB();
/*
import express from "express";;
const app=express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
    })
    app.listen(process.env.PORT,()=>{
        console.log(`App is listening to port ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("ERROR: ", error);
    throw err;
  }
})(); // iifi, by putting semicolon before iifi to prevent error due to any missing ; at the end of line before iifi

function connectDB() {}
*/
