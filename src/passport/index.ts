import passport from 'passport';
import db from '../models';
import {UserModel} from 'src/models/Users';
import localStrategy from './localStrategy';

interface UserObj  {
    readonly userId?:number;
}

export default function(){
    passport.serializeUser<UserModel|number>((user:UserObj,done)=>{
        //console.log(user);
        done(null,user.userId);
    })

    passport.deserializeUser(async(id:number,done)=>{
        try{
            const resultUser = await db.user.findOne({where:{userId:id}});
            
            done(null,resultUser)
        }catch(err){
            console.error(err);
            done(err);
        }
        
    })
    localStrategy();
}

