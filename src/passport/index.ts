import passport from 'passport';
import db from '../models';
import Users from 'src/models/Users';
import localStrategy from './localStrategy';

interface UserObj  {
    readonly userId?:number;
}

export default function(){
    passport.serializeUser((user:UserObj,done)=>{
        done(null,user.userId);
    })

    passport.deserializeUser(async(id:number,done)=>{
        try{
            const resultUser = await db.user.findOne({where:{id}})
            done(null,resultUser)
        }catch(err){
            done(err);
        }
        
    })
    localStrategy();
}

