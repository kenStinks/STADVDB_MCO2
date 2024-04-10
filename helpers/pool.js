const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
dotenv.config();

const poolObject = {
    
    pool_main: mysql.createPool({
        host: process.env.MYSQL_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_MAIN_PORT,
        connectionLimit: 100
    }),
    pool_luzon: mysql.createPool({
        host: process.env.MYSQL_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_LUZON_PORT,
        connectionLimit: 100
    }),
    pool_vismin: mysql.createPool({
        host: process.env.MYSQL_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.MYSQL_VISMIN_PORT,
        connectionLimit: 100
    }),
    pool_current: mysql.createPool({
        host: process.env.MYSQL_HOST,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port:  process.env.VM_IP_CURRENT,
        connectionLimit: 100
    })
}


module.exports = poolObject;