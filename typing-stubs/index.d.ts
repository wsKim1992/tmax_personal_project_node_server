import "express-session";
import 'express';
import jwt from 'jsonwebtoken';
import {UserModel} from '../src/models/Users';

declare module 'express-session' {
  export interface SessionData {
    email?: string;
  }
}

declare module 'express' {
  export interface Request {
    decode?: string | jwt.JwtPayload;
  }
}

declare global {
  namespace Express{
    export interface User extends UserModel{}
  }
}
