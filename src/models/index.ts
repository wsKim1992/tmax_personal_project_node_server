import {Sequelize} from 'sequelize';
import {config} from '../config/config';
import MusicModel from './Musics'
import UserModel from './Users';

const mode =process.env.NODE_ENV==='production'?'production':'development';

export const sequelize = new Sequelize(
    config[mode].database,
    config[mode].username,
    config[mode].password,
    {
        host:config[mode].host,
        dialect:'mysql'
    }
)

const db = {
    sequelize,
    Sequelize,
    music:MusicModel(sequelize),
    user:UserModel(sequelize)
}

db.music.belongsTo(db.user,{foreignKey:'uploader',targetKey: 'userId'});
db.user.hasMany(db.music,{foreignKey:'uploader',sourceKey:'userId'})

export default db;

