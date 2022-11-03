import express, {Request,Response,NextFunction} from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import RouterForUserInfo from "./router/user";
import {CustomError} from "./type_doc/error";
import {sequelize} from "./models";
import passport from 'passport';
import passportConfig from './passport/index';
import cors from 'cors';

dotenv.config();

const whiteList = ['http://localhost:3000','http://localhost:3001']

const corsOption:cors.CorsOptions = {
    origin:whiteList,
    credentials:true,
}

const app = express();
passportConfig();
const sessionMiddleware = session({
    resave:false,
    saveUninitialized:false,
    secret:`${process.env.COOKIE_SECRET}`,
    cookie:{
        maxAge:3600*6*1000,
        httpOnly:true,
        secure:false,//https 일 때만..
    }
})

app.set('port',process.env.PORT||9993);
app.use(cors(corsOption));
app.set('view engine','html');

app.use(express.urlencoded({
  extended: false
}))
app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use('/static',express.static(path.join(__dirname,'static')));
app.use('/auth',RouterForUserInfo);

app.use((req:Request,res:Response,next:NextFunction)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`)! as CustomError;
    error.status=400;
    next(error);
})


app.use((err:CustomError,req:Request,res:Response,next:NextFunction)=>{
    res.locals.message = err.message;
    res.locals.error = err;
    res.status(err.status||500);
    res.render('error');
})

app.listen(app.get('port'),()=>{
    console.log(process.env.DB_PASSWORD)
    console.log(`server listening on ${app.get('port')}`);
    sequelize.sync({force:false})
    .then(()=>{
        console.log('My SQL Database Connected!')
    })
    .catch((err:Error)=>{
        console.error(err);
    })
})