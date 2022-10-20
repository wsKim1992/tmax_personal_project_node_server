import { Sequelize,Model,DataTypes } from "sequelize";
import {Music} from '@type_doc/model_type';

class MusicModel extends Model<Music,Music> implements Music{
    public readonly musicId!:number;
    public readonly artist!: string;
    public readonly title!:string;
    public readonly url!:string;
    public readonly size!:string;
    public readonly genre!:string;
    public readonly uploader!:number
}

export default function(sequelize:Sequelize):typeof MusicModel{
    MusicModel.init({
        musicId:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey: true
        },
        artist:{
            type:DataTypes.STRING(128),
            allowNull:false,
        },
        title:{
            type:DataTypes.STRING(128),
            allowNull:false,
        },
        url:{
            type:DataTypes.STRING(128),
            allowNull:false,
        },
        size:{
            type:DataTypes.STRING(128),
            allowNull:false,
        },
        genre:{
            type:DataTypes.STRING(128),
            allowNull:false,
        },
        uploader:{
            type:DataTypes.INTEGER.UNSIGNED,
            allowNull:false,
        }

    },{
        sequelize,
        tableName:'musics',
        modelName:'musics',
    })

    return MusicModel;
}




