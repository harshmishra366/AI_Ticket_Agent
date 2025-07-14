import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import {inngest} from '../inngest/client.js';
import { use } from 'react';

export const signUp= async (req, res) => {
    const {email,password,skills=[]}=req.body;
    try{
       const hashed= bcrypt.hash(password, 10)
       const user= await User.create({
        email,
        password:hashed,
        skills
       })
       if(!user){
        console.log("Failed to create user");
        return res.status(500).json({error:"Failed to create user"});
       }
       console.log(user);
       // fire ingest event (background job)
       await inngest.send({
        event:"user.signup",
        data:{
            email:email
        }
       })
         // generate JWT token
         const token= jwt.sign({_id:user._id, role:user.role}, process.env.JWT_SECRET);
         res.json({
            user:{
                _id:user._id,
                email:user.email,
                role:user.role,
                skills:user.skills,
                createdAt:user.createdAt
            },
            token
         })
    }
    catch(err){
        console.error("Error during user signup:", err);
        return res.status(500).json({error:"Sign up Failed  error"});
    }
}

export const login= async (req, res) => {
    const {email,password}=req.body;
    try{
        
        if(!email || !password){
            return res.status(400).json({error:"Email and password are required"});
        }
      const user= await User.findOne({ email});
         if(!user){
          console.log("User not found");
          return res.status(404).json({error:"User not found"});
         }
         const isMstch=  bcrypt.compare(password,user.password)
            if(!isMstch){
            console.log("Invalid password");
            return res.status(401).json({error:"Invalid password"});
            }
       
       console.log(user);
       const token= jwt.sign({_id:user._id, role:user.role}, process.env.JWT_SECRET);
         res.json({
            user:{
                _id:user._id,
                email:user.email,
                role:user.role,
                skills:user.skills,
                createdAt:user.createdAt
            },
            token
         })
        
      
    }
    catch(err){
        console.error("Error during user signup:", err);
        return res.status(500).json({error:"login  Failed  error"});
    }
}