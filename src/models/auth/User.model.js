import { DataTypes } from "sequelize";
//import db from '@/db/database.js';

const userConfig =
    {
        userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        displayName: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
        roles: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },
    };

//const User = await db.define('User', userConfig, { tableName: 'Users' });

export default userConfig;