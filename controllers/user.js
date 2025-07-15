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

export const logout = async(req,res)=>{
   try {
     const token = req.headers.authorization?.split(" ")[1];
     if(!token){
         return res.status(401).json({error:"Unauthorized"});
     }
     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
         if (err) {
             return res.status(401).json({ error: "Invalid token" });
         }

         res.json({ message: "Logged out successfully" });
     });
   } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({error:"Logout Failed"});   
    
   }
}

export const updateUser= async(req,res)=>{
    const {skills=[],role,email}=req.body;
    try {
        if( req.user?.role !== 'admin'){
            return res.status(403).json({error:"Forbidden: You do not have permission to update user details"});
        }
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        await User.updateOne({email},{
            skills:skills.length ? skills : user.skills,role
        })
        return res.json({message:"User updated successfully"});
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({error:"Failed to update user"});
        
    }
}


export const getUserDetails=async(req,res)=>{
    try {
        if(!req.user.role !== 'admin'){
            return res.status(403).json({error:"Forbidden: You do not have permission to view user details"});
        }
        const user= await User.find().select('-password')
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        return res.json({
            _id:user._id,
            email:user.email,
            role:user.role,
            skills:user.skills,
            createdAt:user.createdAt
        });
        
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({error:"Failed to fetch user details"});
        
    }
}