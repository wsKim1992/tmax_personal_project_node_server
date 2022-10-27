import {Request,Response,NextFunction} from 'express';
import db from '../models';
import dotenv from 'dotenv';
import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    email?:string;
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