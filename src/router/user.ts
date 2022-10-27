import {Router,Request,Response, NextFunction} from 'express';
import db from '../models';
import {isLoggedIn,isNotLoggedIn,checkBeforeSendEmail} from './middleware';
import sendMail from './util/sendEmail';
import passport from 'passport';
import bcrypt from 'bcrypt';
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
        const sendResult = await sendMail(sendMailParam);
        req.session.email=code;
        setTimeout(()=>{
            const {session}=req;
            delete session.email;
        },60000*1);
        res.status(200).json({flag:true,message:`${email}로 인증 메일 보냈습니다. 코드를 입력해 주세요!`})
    }catch(err:any){
        console.error(err.message);
        res.status(500).json({message:err.message});
    }
});

RouterForUserInfo.post('/cancelSendMailSession',isNotLoggedIn,(req:Request,res:Response,next:NextFunction)=>{
    const {session}=req;
    console.log(session);
    const {email} = session;
    console.log(email);
    if(email){
        delete session.email;
        res.status(200).json({message:'session deleted!'});
    }else{
        res.status(200).json({message:'no session exist!'});
    }
})

RouterForUserInfo.post('/compareCode',isNotLoggedIn,(req:Request,res:Response,next:NextFunction)=>{
    const {code} = req.body;
    console.log(`code: ${code}`);
    const {session} = req;
    console.log(`session code : ${session?.email}`);

    if(session?.email){
        if(session.email===code){
            delete session.email;
            res.status(200).json({flag:true,message:'코드가 일치 합니다.'})
        }else{
            res.status(200).json({flag:false,message:'코드가 일치하지 않습니다.'})
        }
    }else{
        res.status(200).json({flag:false,message:'세션시간이 종료되었습니다. 이메일을 재전송 해주세요!'});
    }
})

RouterForUserInfo.post('/signUpUser',isNotLoggedIn,checkBeforeSendEmail,async(req:Request,res:Response)=>{
    try{
        const {password,email,username} = req.body;
        console.log(email);
        console.log(username);
        console.log(password);
        const newPassword = await bcrypt.hash(password,Number(process.env.GEN_SALT_COUNT));
        const user = await db.user.create({password:newPassword,email,username});
        console.log(user);
        res.status(200).json({flag:true,message:'회원가입에 성공했습니다. 로그인 페이지로 이동하겠습니다.'})
    }catch(err){
        console.error(err);
        res.status(500).json({message:'db 추가중에 오류가 발생.'});
    }
    
});

export default RouterForUserInfo;