import express from "express";
import dotenv from "dotenv";
import "./model/index.js"
// const jwt = require('jsonwebtoken');
import { User } from "./model/User.js"

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const PORT = process.env.BE_PORT || 3000;
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


const ReactAppDistPath = new URL("../front-end/dist/", import.meta.url);
const ReactAppIndex = new URL("../front-end/dist/index.html", import.meta.url);


app.use(express.static(ReactAppDistPath.pathname));



/*
 * express.static match auf jede Datei im angegebenen Ordner
 * und erstellt uns einen request handler for FREE
 * app.get("/",(req,res)=> res.sendFile("path/to/index.html"))
 * app.get("/index.html",(req,res)=> res.sendFile("path/to/index.html"))
 */



app.get("/api/status", (req, res) => {
  res.send({ status: "Ok" });
});

app.post("/api/signup", async (req, res) => {
  const {name, email, password} =req.body
  // res.send({ status: "signup klappt" });
  try {
    
  
    const existUser = await User.findOne({email});
    if (existUser){
      return res.status(409).json({error:"benutzer mit dieser email existiert bereits"})
    }
  const newUser = new User({
    name,
    email,
  })
  newUser.setPassword(password)
  
  await newUser.save()
  
  res.status(201).json({message:"Registrierung erfolgreich"})
  } catch (error){
    res.status(500).json({error: "Serverfehler"})
  }
  })


app.post("/api/login", async (req,res)=>{
  const {email, password} =req.body

  try {
    
    const existUser = await User.findOne({email});
    if (!existUser){
      return res.status(401).json({message:"Invalid mail or password"})
    }

    const validPassword = existUser.verifyPassword(password)
    if(!validPassword){
      return res.status(401).json({message:"Invalid mail or password"})
    }

    res.status(200).json({message:"Login successful"})
  }catch (error){
    res.status(500).json({message:"Internal error"})
  }})

  


app.get("/*", (req, res) => {
  res.sendFile(ReactAppIndex.pathname);
});


app.listen(PORT, () => {
  console.log("Server running on Port: ", PORT);
});

