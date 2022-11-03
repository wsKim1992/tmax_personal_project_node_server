import {Request,Response,NextFunction} from 'express';
import db from '../models';
import 'express-session';
import jwt,{TokenExpiredError} from 'jsonwebtoken';
import {UserModel} from '../models/Users'
import {UserTypeForSession} from '../type_doc/model_type'
declare module 'express-session' {
    export interface SessionData {
      email?: string;
    }
  }
  
  declare module 'express' {
    export interface Request {
      decode?: string | jwt.JwtPayload;
      userData?:UserTypeForSession
    }
  }
  
  declare global {
    namespace Express{
      export interface User extends UserModel{}
    }
  }

export const checkProperUser = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        if(!req.user){
            throw new Error('허용 되지 않는 사용자');
        }
        const verifyJWTResult = jwt.verify(req.headers.authorization as string,`${process.env.JWT_SECRET}`,{
            algorithms:['HS256']
        });
        req.decode = verifyJWTResult;
        const JWTPayloadBase64 = req.headers.authorization?.split(".")[1];
        const payload = Buffer.from(JWTPayloadBase64! as string,'base64');
        const result = JSON.parse(payload.toString());
        if(result.userId!==req.user?.userId){
            throw new Error('허용 되지 않는 사용자');
        }
        const userInfoExistCheck = await db.user.findOne({where:{userId:result.userId},attributes:["userId"]});
        if(userInfoExistCheck){
            const {email} = result;
            req.userData = {email}
            next();
        }else{
            throw new Error('user가 존재하지 않음!');
        }
    }catch(err: unknown){
        console.error(err);
        if(err instanceof TokenExpiredError){
            return res.status(401).json({message:'허용 되지 않는 사용자!'});
        }else if(err instanceof Error){
            return res.status(500).json({
                message:err.message?err.message:'인증 프로세스 오류!'
            });
        }
    }
}

export const checkBeforeSendEmail = async(req:Request,res:Response,next:NextFunction)=>{
    const {email} = req.body;
    const emailRegEx = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    const validEmailCheck = emailRegEx.test(email);
    if(validEmailCheck){
        const {user} = db;
        const checkUserExistsInDB = await user.findOne({where:{email},attributes:["email"]});
        if(checkUserExistsInDB){
            let emailErrorObj= {flag:false,message:'이미 존재하는 이메일 입니다!'}
            res.status(400).json(emailErrorObj);
        }else{
            //console.log(req.session.email)
            next();
        }

    }else{
        let emailErrorObj = {flag:false,message:'이메일 형식을 지켜서 입력해 주세요!'};
        res.status(400).json(emailErrorObj);
    }
}

export const isLoggedIn = (req:Request,res:Response,next:NextFunction)=>{
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).json({message:'로그인 필요'})
    }
}

export const isNotLoggedIn = (req:Request,res:Response,next:NextFunction)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.status(403).json({message:'로그인한 상태'});
    }
}