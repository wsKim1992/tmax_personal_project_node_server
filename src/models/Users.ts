import {Sequelize,DataTypes,Model} from 'sequelize';
import {User,UserInterface} from '@type_doc/model_type';

export class UserModel extends Model<User,UserInterface> implements User{
  public userId:number=0;
  public email!:string;
  public password!:string;
}

export default function(sequelize:Sequelize):typeof UserModel{
  UserModel.init({
    email:{
      type:DataTypes.STRING(128),
      allowNull:false,
    },
    userId:{
      allowNull:false,
      autoIncrement:true,
      type:DataTypes.INTEGER.UNSIGNED,
      primaryKey: true
    },
    password:{
      type:DataTypes.STRING(256),
      allowNull:false,
    },
    username:{
      type:DataTypes.STRING(128),
      allowNull:false,
    }
  },{
    sequelize,
    tableName:'users',
    modelName:'users',
  })
  return UserModel;
}

