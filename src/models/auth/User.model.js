import { Sequelize, DataTypes } from "sequelize";
import db from "../../db/database";

const User = db.define(
    'User',
    {
        userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        displayName: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ACTIVE' },
    }
)