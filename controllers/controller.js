const dotenv = require('dotenv')
const logs = require('../Helpers/logs.js')
const pool = require('../helpers/pool.js')

dotenv.config();

console.log(process.env.MYSQL_HOST);

const luzonRegions = [
    'National Capital Region (NCR)',
    'Cordillera Administrative Region (CAR)',
    'Ilocos Region(I)',
    'Cagayan Valley (II)',
    'Central Luzon (III)',
    'Calabarzon (IV-A)',
    'Southwestern Tagalog Region (Mimaropa)',
    'Bicol Region (V)'
]

const visMinRegions = [
    'Western Visayas (VI)',
    'Central Visayas (VII)',
    'Eastern Visayas (VIII)',
    'Zamboanga Peninsula (IX)',
    'Northern Mindanao (X)',
    'Davao Region(XI)',
    'Soccsksargen (XII)',
    'Caraga (XIII)',
    'Bangsamoro (BARMM)'
]

async function getData(page, limit) {
    
    // try {
    //     const [rows] = await pool.pool_main.query(
    //     `
    //     SELECT * 
    //     FROM Appointments.appointments
    //     LIMIT ${limit}
    //     OFFSET ${(page-1)*limit}
    //     `
    //     )
    //     console.log(rows);
    //     return rows;
    // } catch (error) {
        
    // }

    try {
        var newLimit = math.ceil(limit/2)
        var [row0] = await pool.pool_luzon.query(
            `
            SELECT * 
            FROM Appointments.appointments
            LIMIT ${newLimit}
            OFFSET ${(page-1)*newLimit}
            `
            )
        
        var [row1] = await pool.pool_vismin.query(
        `
        SELECT * 
        FROM Appointments.appointments
        LIMIT ${newLimit}
        OFFSET ${(page-1)*newLimit}
        `
        )
        console.log(row0.concat(row1));
    } catch (error) {
        
    }
}

async function deleteData(id) {

    var transactionID = logs.generateUUID();
    var connection = await pool.pool_main.getConnection();
    
    logs.logTransaction(`${transactionID} START DELETE`);
    try {
        await connection.beginTransaction();
    
        var data = await connection.query(`SELECT * FROM ${process.env.MYSQL_DB_TABLE} WHERE AppointmentID = "${id}"`);

        Object.keys(data).forEach(keys => {
            logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
        });

        logs.logTransaction(`${transactionID} COMMIT DELETE`);
    } catch (error) {
        logs.logTransaction(`${transactionID} ABORT DELETE`);
        await connection.rollback()
        pool.pool_main.releaseConnection();
    }
    // const [rows] = await pool.query(
    // `
    // SET TRANSACTION LEVEL
    // DELETE
    // FROM Appointments.appointments
    // WHERE AppointmentID = "${id}"
    // `
}

async function updateData(data) {

    var transactionID = logs.generateUUID();
    var connection = await pool.pool_main.getConnection();

    logs.logTransaction(`${transactionID} START UPDATE`);
    try {
        await connection.beginTransaction();

        Object.keys(data).forEach(keys => {
            logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
        });

        const query = `
        UPDATE Appointments.appointments
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
        `;
        await connection.query(query);
        logs.logTransaction(`${transactionID} COMMIT UPDATE`);
        await connection.commit();
    } catch (err) {
        logs.logTransaction(`${transactionID} ABORT UPDATE`);
        await connection.rollback()
        pool.pool_main.releaseConnection();
    }
}

async function addData(data) {

    var transactionID = logs.generateUUID();
    var connection = await pool.pool_main.getConnection();

    logs.logTransaction(`${transactionID} START INSERT`);
    try {
        await connection.beginTransaction();

        Object.keys(data).forEach(keys => {
            logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
        });

        var query = `
        INSERT INTO Appointments.appointments 
        (DoctorMainSpecialty, HospitalName, HospitalCity, HospitalRegionName, Status, Type, IsVirtual, TimeQueued, QueueDate, StartTime, EndTime, AppointmentID, PatientID, ClinicID, DoctorID, PatientAge, IsHospital, HospitalProvince) VALUES 
        ("${data.DoctorMainSpecialty}",
        "${data.HospitalName}",
        "${data.HospitalCity}",
        "${data.HospitalRegionName}",
        "${data.Status}",
        "${data.Type}",
        ${data.IsVirtualInt},
        CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
        CAST('${data.QueueDate}' as DATETIME),
        CAST('1999-01-01 ${data.StartTime}' as DATETIME),
        CAST('1999-01-01 ${data.EndTime}' as DATETIME),
        REPLACE(uuid(), '-', ''),
        REPLACE(uuid(), '-', ''),
        REPLACE(uuid(), '-', ''),
        REPLACE(uuid(), '-', ''),
        20,
        1,
        ""
        );
        `
        await connection.query(query);
        logs.logTransaction(`${transactionID} COMMIT INSERT`);
        await connection.commit();
    } catch (error) {
        logs.logTransaction(`${transactionID} ABORT INSERT`);
        await connection.rollback()
        pool.pool_main.releaseConnection();
    }


    // const [rows] = await pool.pool_main.query()
}

async function getMax(){
    const [rows] = await pool.pool_main.query(
    `
    SELECT COUNT(*) as count
    FROM Appointments.appointments
    `
)
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

function selectRegion(region) {
    if (luzonRegions.includes(region)) {   
        return pool.pool_luzon;
    } else {
        return pool.pool_vismin;  
    }
}

const controller = {

    getIndex: async function (req, res) {
        console.log(req.query)

        const limit = 10; //entries per page
        var maxpage = await getMax(); //maximum possible page
        var maxpage = Math.ceil(maxpage[0].count/limit)

        const page = Math.min(Math.max(parseInt(req.query.page) || 1, 1), maxpage);
        

        const rows = await getData(page,limit);
        //console.log(rows);

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

        //console.log(table);

        
        
        data = {
            table: table,
            query: req.query,
            page: page,
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
        console.log(data.isVirtual)

        if(data.isVirtual) 
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

    addID: async function (req, res) {
        var data = req.body
        if(data.isVirtual) 
        {
            data.IsVirtualInt = 1;
        } else {data.IsVirtualInt = 0;}

        addData(data)
        console.log(data)
    },
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;