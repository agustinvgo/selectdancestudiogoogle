const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversacion = sequelize.define('Conversacion', {
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'alumnos',
            key: 'id'
        }
    },
    mensajes: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    requiere_atencion_humana: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'conversaciones',
    timestamps: true
});

module.exports = Conversacion;
