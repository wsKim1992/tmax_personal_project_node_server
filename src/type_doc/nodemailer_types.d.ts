import nodemailer from "nodemailer";

export interface sendMailParams extends nodemailer.SendMailOptions{
    code?:string
}
