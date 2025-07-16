import express from "express";
import { login, logout, signUp, updateUser } from "../controllers/user.js";
import { authenticate } from "../middleware/auth.js";
import { createTicket, getTicketById, getTickets } from "../controllers/ticket.js";

const router = express.Router();
router.get('/',authenticate,getTickets)
router.get('/:id',authenticate,getTicketById)
router.post('/',authenticate,createTicket)



export default router;