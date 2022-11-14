import {Express, Request, Response, NextFunction } from 'express';
import db from '../models';
import 'express-session';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { UserModel } from '../models/Users'
import { UserTypeForSession } from '../type_doc/model_type';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

declare module 'express-session' {
    export interface SessionData {
        email?: string;
    }
}

/* declare module 'express' {
    export interface Request {
        decode?: string | jwt.JwtPayload;
        userData?: UserTypeForSession,
        file?:Express.Multer.File
    }
} */

declare global {
    namespace Express {
        export interface User extends UserModel { }
        export interface Request {
            decode?: string | jwt.JwtPayload;
            userData?: UserTypeForSession,
            file?:Express.Multer.File
        }
    }
}

const albumCoverUploadStorageOptions:multer.DiskStorageOptions={
    destination:function(req:Request,file:Express.Multer.File,cb){
        const dirPath = path.join(__dirname,'../static','albumImage');
        if(!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath);
        }
        cb(null,dirPath);
    },
    filename:function(req:Request,file:Express.Multer.File,cb){
        const {originalname,mimetype}=file;
        const filePath = path.join(__dirname,'../static','albumImage',`${originalname}`);
        const mimeErrorFlag = mimetype.search(/image/g)===-1;
        const existsErrorFlag = fs.existsSync(filePath);
        if(mimeErrorFlag||existsErrorFlag){
            const errObj = mimeErrorFlag?'이미지 파일이 아닙니다':'파일이 이미 존재 합니다';
            cb(new Error(errObj),'');
        }else{
            cb(null,`${originalname}.${mimetype.split('/')[1]}`)
        }
    }
}

const albumCoverUploadStorage : multer.StorageEngine= multer.diskStorage({
    ...albumCoverUploadStorageOptions
})

const albumCoverUploadMulterOptions :multer.Options={
    storage:albumCoverUploadStorage,
    fileFilter:(req:Request,file:Express.Multer.File,cb)=>{
        if(file.mimetype.search(/image/g)===-1){
            cb(null,false);
        }else{
            cb(null,true);
        }
    },
    limits:{
        fileSize:50*1024*1024,
    }
};

export const albumCoverUploadModule = multer({...albumCoverUploadMulterOptions});

const musicUploadStorageOptions:multer.DiskStorageOptions = {
    destination:function(req:Request,file:Express.Multer.File,cb){
        cb(null,path.join(__dirname,'../static','music'));
    },
    filename:async function(req:Request,file:Express.Multer.File,cb){
        const {originalname,mimetype} = file;
        const filePath = path.join(__dirname,'../static','music',`${originalname}.${mimetype.split('/')[1]}`);
        const exists = await fs.existsSync(filePath);
        console.log(exists);
        if(exists){
            cb(new Error('파일이 이미 존재합니다.'),'');
        }else{
            cb(null,`${originalname}.${mimetype.split('/')[1]}`);
        }
    }
}

const musicUPloadStorage : multer.StorageEngine = multer.diskStorage({
    ...musicUploadStorageOptions
})

const musicUploadMulterOptions:multer.Options = {
    storage:musicUPloadStorage,
    fileFilter:(req:Request,file:Express.Multer.File,cb)=>{
        if(file.mimetype.search(/audio/g)===-1){
            cb(null,false);
        }else{
            cb(null,true);
        }
    },
    limits:{
        fileSize:50*1024*1024,
    }
}

export const musicUploadModule = multer({...musicUploadMulterOptions});

export const checkProperUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: '허용 되지 않는 사용자!' });
        }
        const verifyJWTResult = jwt.verify(req.headers.authorization as string, `${process.env.JWT_SECRET}`, {
            algorithms: ['HS256']
        });
        req.decode = verifyJWTResult;
        const JWTPayloadBase64 = req.headers.authorization?.split(".")[1];
        const payload = Buffer.from(JWTPayloadBase64! as string, 'base64');
        const result = JSON.parse(payload.toString());
        if (result.userId !== req.user?.userId) {
            return res.status(401).json({ message: '허용 되지 않는 사용자!' });
        }
        const userInfoExistCheck = await db.user.findOne({ where: { userId: result.userId }, attributes: ["userId"] });
        if (userInfoExistCheck) {
            const { email } = result;
            console.log(`email : ${email}`);
            next();
        } else {
            throw new Error('user가 존재하지 않음!');
        }
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: '허용 되지 않는 사용자!' });
        } else if (err instanceof Error) {
            return res.status(500).json({
                message: err.message ? err.message : '인증 프로세스 오류!'
            });
        }
    }
}

export const checkBeforeSendEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const emailRegEx = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    const validEmailCheck = emailRegEx.test(email);
    if (validEmailCheck) {
        const { user } = db;
        const checkUserExistsInDB = await user.findOne({ where: { email }, attributes: ["email"] });
        if (checkUserExistsInDB) {
            let emailErrorObj = { flag: false, message: '이미 존재하는 이메일 입니다!' }
            res.status(400).json(emailErrorObj);
        } else {
            //console.log(req.session.email)
            next();
        }

    } else {
        let emailErrorObj = { flag: false, message: '이메일 형식을 지켜서 입력해 주세요!' };
        res.status(400).json(emailErrorObj);
    }
}

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ message: '로그인 필요' });
    }
}

export const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({ message: '로그인한 상태' });
    }
}