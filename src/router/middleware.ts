import {Request,Response,NextFunction} from 'express'

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