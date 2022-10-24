import {Router,Request,Response, NextFunction} from 'express';
import db from '../models';
import bcrypt from 'bcrypt';
import {isLoggedIn,isNotLoggedIn,checkBeforeSendEmail} from './middleware';
import sendMail from './util/sendEmail';
import passport from 'passport';
import {sendMailParams} from '../type_doc/nodemailer_types';
import createRandomBytes from './util/generateRandomByte'

declare module 'express-session' {
    export interface SessionData {
      email?:string;
    }
  }

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

RouterForUserInfo.post('/sendEmail',isNotLoggedIn,checkBeforeSendEmail,async(req:Request,res:Response)=>{
    try{
        const {email} = req.body;
        const code = await createRandomBytes(12);
        const sendMailParam:sendMailParams = {
            to:email,
            subject:"이메일 인증번호 전송",
            code
        } 
        await sendMail(sendMailParam);
        req.session.email=code;
        setTimeout(()=>{
            const {session}=req;
            delete session.email;
        },6000*3);
        res.status(200).json({flag:true,message:`${email}로 인증 메일 보냈습니다. 코드를 입력해 주세요!`})
    }catch(err:any){
        const errObj = JSON.parse(err.message);
        console.log(errObj);
        res.status(500).json({message:errObj.message});
    }
});

export default RouterForUserInfo;