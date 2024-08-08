// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    // console.log("Devvart");
    app.on("error", (error) => {
      console.log("ERRR: ", error);
      throw error;
    });
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port} 🔥`));
  })
  .catch((err) => {
    console.log("MongoDB connection failed !", err);
  });
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
