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

  async function deleteData(id) {
    const [rows] = await pool.query(`
    DELETE
    FROM appointments.appointments
    WHERE AppointmentID = "${id}"
    `)
  }

  async function updateData(data) {
    const [rows] = await pool.query(`
    UPDATE appointments.appointments
    SET DoctorMainSpecialty = "${data.DoctorMainSpecialty}",
    HospitalName = "${data.HospitalName}",
    HospitalCity = "${data.HospitalCity}",
    HospitalRegionName = "${data.HospitalRegionName}",
    Status = "${data.Status}",
    Type = "${data.Type}",
    IsVirtual = ${data.IsVirtualInt},

    TimeQueued = CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
    QueueDate = CAST('${data.QueueDate}' as DATETIME),
    StartTime = CAST('1999-01-01 ${data.StartTime}' as DATETIME),
    EndTime = CAST('1999-01-01 ${data.EndTime}' as DATETIME)

    WHERE AppointmentID = "${data.id}"
    `)
  }

async function getMax(){
    const [rows] = await pool.query(`
    SELECT COUNT(*) as count
    FROM appointments.appointments
    `)
    return rows;
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

const controller = {

    getIndex: async function (req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; //entries per page

        const rows = await getData(page,limit);
        console.log(rows);

        var table = rows.map((item) => ({
            AppointmentID: item.AppointmentID,
            DoctorMainSpecialty: item.DoctorMainSpecialty,
            HospitalName: item.HospitalName,
            HospitalCity: item.HospitalCity,
            HospitalRegionName: item.HospitalRegionName,
            Status: item.Status,
            TimeQueued: formatAMPM(new Date(item.TimeQueued)),
            QueueDate: new Date(item.QueueDate).toISOString().split('T')[0],
            StartTime: formatAMPM(new Date(item.StartTime)),
            EndTime:formatAMPM(new Date(item.EndTime)),
            Type:item.Type,
            isVirtual: item.IsVirtual,
            
        }));

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

    updateID: async function (req, res) {
        var data = req.body
        console.log(data.IsVirtual)

        if(data.IsVirtual) 
        {
            data.IsVirtualInt = 1;
        }else {data.IsVirtualInt = 0;}
        console.log(data)

        updateData(data)
        
        
        
    },

    deleteID: async function (req, res) {
        const data = req.body
        deleteData(data.id)
        console.log(data)
    },


}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;