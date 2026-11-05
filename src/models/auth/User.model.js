import { DataTypes } from "sequelize";

const UserConfig =
    {
        userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        displayName: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ACTIVE' },
        roles: { type: DataTypes.ARRAY(DataTypes.STRING) },
    };

export default UserConfig;