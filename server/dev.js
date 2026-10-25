import 'dotenv/config';import express from 'express';import cors from 'cors';import login from './login.js';
const app=express();app.use(cors({origin:['http://localhost:5173','http://127.0.0.1:5173']}));app.use(express.json({limit:'16kb'}));app.post('/api/login',login);app.listen(process.env.PORT||3001,()=>console.log('API local na porta '+(process.env.PORT||3001)));
