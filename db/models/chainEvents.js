import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chainEvents extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "chainEvents_name_key"
    },
    lastBlock: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'chainEvents',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "chainEvents_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "chainEvents_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
