import {sequelizeDataConfigType,sequelizeDataConfigSingleType} from '../type_doc/sequelize';
import * as dotenv from "dotenv";
dotenv.config();

export const config:sequelizeDataConfigType={
  development: {
    username: `${process.env.DB_USERNAME}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_DATABASE}`,
    host: `${process.env.DB_HOST}`,
    dialect: "mysql"
    },
  test: {
    username: `${process.env.DB_USERNAME}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_DATABASE}`,
    host: `localhost`,
    dialect: "mysql"
  },
  production: {
    username: `${process.env.DB_USERNAME}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_DATABASE}`,
    host: `localhost`,
    dialect: "mysql"
  }
}