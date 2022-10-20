import { Router } from "express";
import path, { dirname } from 'path';
const tempRouter = Router();

tempRouter.get("/page",(req,res)=>{
    console.log(path.join(__dirname,'../public/auth.html'));
    res.sendFile(path.join(__dirname,'../public/auth.html'))
})

export default tempRouter;