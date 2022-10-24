import crypto from 'bcrypt';

export default async(num:number):Promise<string>=>{
    try{
        const randomBytes = await crypto.genSalt(num);
        return randomBytes;
    }catch(err){
        const errObject= {message:"코드생성 오류!"}
        throw new Error(JSON.stringify(errObject));
    }
    
}