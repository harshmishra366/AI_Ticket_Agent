import express from "express";
import { login, logout, signUp, updateUser } from "../controllers/user";
import { authenticate } from "../middleware/auth";

const router = express.Router();
router.post('/signup', signUp)
router.post('/login', login);
router.post('/logiut',logout)
router.post('/update-user',authenticate,updateUser);
router.get('/users', authenticate, updateUser);


export default router;