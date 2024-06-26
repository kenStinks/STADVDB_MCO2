const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config();

const poolObject = {
    pool_main: {
        host: process.env.MYSQL_MAIN_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_MAIN_PORT,
        connectionLimit: 100
    },
    pool_luzon: {
        host: process.env.MYSQL_LUZON_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_LUZON_PORT,
        connectionLimit: 100
    },
    pool_vismin: {
        host: process.env.MYSQL_VISMIN_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_VISMIN_PORT,
        connectionLimit: 100
    },
    pool_current: {
        host: process.env.MYSQL_HOST_CURRENT,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_CURRENT_PORT,
        connectionLimit: 100
    }
}

module.exports = poolObject;