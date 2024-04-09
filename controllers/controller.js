const dotenv = require('dotenv')
const mysql = require('mysql2')
dotenv.config();

console.log(process.env.MYSQL_HOST)

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user:  process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function getData(page,limit) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM appointments.appointments
    LIMIT ${limit}
    OFFSET ${(page-1)*limit}
    `)
    return rows;
  }

async function getMax(){
    const [rows] = await pool.query(`
    SELECT COUNT(*) as count
    FROM appointments.appointments
    `)
    return rows;
}

const controller = {

    getIndex: async function (req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; //entries per page

        const table = await getData(page,limit);
        console.log(table);

        var maxpage = await getMax(); //maximum possible page
        var maxpage = Math.ceil(maxpage[0].count/limit)
        
        data = {
            table: table,

            page: Math.min(Math.max(page, 1), maxpage),
            prev_page: Math.max(page-1, 1),
            next_page: Math.min(page+1, maxpage),
            min_page: 1,
            max_page: maxpage,

            isFirst: (page==1),
            isLast: (page==maxpage)

        }
        
        res.render('index', data);
    },
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;