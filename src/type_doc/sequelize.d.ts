export interface sequelizeDataConfigSingleType{
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: string;
}

export interface sequelizeDataConfigType{
    development:sequelizeDataConfigSingleType;
    test:sequelizeDataConfigSingleType;
    production:sequelizeDataConfigSingleType;
}