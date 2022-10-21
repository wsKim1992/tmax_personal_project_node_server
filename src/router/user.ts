import {Router,Request,Response, NextFunction} from 'express';
import db from '../models';
import bcrypt from 'bcrypt';
import {isLoggedIn,isNotLoggedIn} from './middleware';
import passport from 'passport';

const RouterForUserInfo = Router();

RouterForUserInfo.get('/getUser',(req:Request,res:Response)=>{
    return res.status(200).json({message:"hello"});
})

RouterForUserInfo.post('/login',isNotLoggedIn,(req:Request,res:Response,next:NextFunction)=>{
    passport.authenticate('local',(error:Error,user:typeof db.user|boolean,info:any)=>{
        if(!user||error){
            return res.status(200).json({errFlag:true,message:info.message})
        }
        return req.login(user,loginError=>{
            if(loginError){return next(loginError);}
            return res.status(200).json({errFlag:true,message:'로그인 성공!'})
        })
    })(req,res,next)
})

RouterForUserInfo.post('/checkEmailExists',isNotLoggedIn,async(req:Request,res:Response,next:NextFunction)=>{
    const {email} = req.body;
    try{
        const exists = await db.user.findOne({
            where:{email:email},
            attributes:["email","userId"]
        })
        if(exists){
            res.status(200).json({message:'user 정보가 있습니다.',flag:false})
        }else{
            return res.status(200).json({message:'email 유일성 확인!',flag:true})
        }
    }catch(err){
        console.error(err);
        return next(err)
    }

})


export default RouterForUserInfo;