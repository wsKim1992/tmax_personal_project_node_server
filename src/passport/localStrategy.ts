import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import db from '../models';

export default ()=>{
    const {Strategy:LocalStrategyObj} = LocalStrategy;
    const {user} = db;
    passport.use('local',
        new LocalStrategyObj(
            {
                usernameField:'email',
                passwordField:'password',
            },
            async(email:string,password:string,done:any)=>{
                try{
                    const exUser = await user.findOne({where:{email}})
                    if(exUser){
                        const result = await bcrypt.compare(exUser.password,password);
                        if(result){
                            done(null,exUser);
                        }else{
                            done(null,false,{message:'비밀번호가 일치하지 않습니다!'});
                        }
                    }else{
                        done(null,false,{message:'가입되지 않은 회원임'})
                    }
                }catch(err){
                    console.error(err);
                    done(err)
                }
            }
        )
    )
}