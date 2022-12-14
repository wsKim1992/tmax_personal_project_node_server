import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import RouterForUserInfo from "./router/user";
import RouterForMusicData from './router/music';
import { CustomError } from "./type_doc/error";
import { sequelize } from "./models";
import passport from 'passport';
import passportConfig from './passport/index';
import cors from 'cors';
import bodyParser from 'body-parser'
dotenv.config();

const whiteList = ['http://localhost:3000', 'http://localhost:3001']

const corsOption: cors.CorsOptions = {
    origin: whiteList,
    credentials: true,
}

const app = express();
passportConfig();
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: true,
    secret: `${process.env.COOKIE_SECRET}`,
    cookie: {
        maxAge: 1000*60*60*24,
        httpOnly: true,
        secure: false,//https 일 때만..
    }
})

app.set('port', process.env.PORT || 9993);
app.use(cors(corsOption));
app.set('view engine', 'html');

//app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.json({ limit: 5000000000 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 5000000000 }));

//app.use(bodyParser.raw({type:'application/mpeg',limit:'100mb'}))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use('/assets', express.static(path.join(__dirname, 'static')));
app.use('/auth', RouterForUserInfo);
app.use('/music', RouterForMusicData);

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`)! as CustomError;
    error.status = 400;
    next(error);
})

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.locals.message = err.message;
    res.locals.error = err;
    res.status(err.status||500).json({message:err.message});
})

app.listen(app.get('port'), () => {
    console.log(process.env.DB_PASSWORD)
    console.log(`server listening on ${app.get('port')}`);
    sequelize.sync({ force: false })
        .then(() => {
            console.log('My SQL Database Connected!')
        })
        .catch((err: Error) => {
            console.error(err);
        })
})