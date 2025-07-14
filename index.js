import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log('MongoDB connected successfully');
    app.listen(PORT,()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});