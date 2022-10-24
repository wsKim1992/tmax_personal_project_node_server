import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import {sendMailParams} from '../../type_doc/nodemailer_types';

dotenv.config();


const sendMail = async(param:sendMailParams):Promise<void>=>{
    console.log(`auth email : ${process.env.AUTH_EMAIL_ADDR}`);
    console.log(`auth pass : ${process.env.AUTH_EMAIL_PWD}`)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: Number(process.env.AUTH_EMAIL_PORT),
        host: "smtp.gmail.com",
        secure: true,
        requireTLS: true,
        auth: {
            user: process.env.AUTH_EMAIL_ADDR?.toString(),
            pass: process.env.AUTH_EMAIL_PWD?.toString(),
        },
  });
  
  const mailOptions :nodemailer.SendMailOptions={
    from : process.env.AUTH_EMAIL_ADDR,
    to: param.to,
    subject:param.subject,
    html:`<h1>인증 코드 : ${param.code}</h1>`
  }
  try{
    await transporter.sendMail(mailOptions);
  }catch(err){
    const message = "메일 전송 실패!"
    console.error(err);
    throw new Error(JSON.stringify({message}));
  }
}

export default sendMail;