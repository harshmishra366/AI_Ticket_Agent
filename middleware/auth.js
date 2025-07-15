import jwt from 'jsonwebtoken';


export const authenticate=(req,res,next)=>{
     const token=req.headers.autherization?.split(" ")[1];
     if(!token){
        return res.status(401).json({error:"Unauthorized.Access denied "});
     }

     try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next()

        
     } catch (error) {
        res.status(401).json({error:"Invalid token"});
        
     }
}