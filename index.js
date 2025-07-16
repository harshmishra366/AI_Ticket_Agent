import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.js';
import ticketRoutes from './routes/ticket.js';
import {serve} from 'inngest/express';
import {inngest} from './inngest/client.js';
import { onTicketCreated } from './inngest/functions/on-ticket-create.js';
import {onUserSignup} from './inngest/functions/onsignup.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api/auth",userRoutes)
app.use("/api/tickets", ticketRoutes);

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions: [onTicketCreated, onUserSignup],
    })

)
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