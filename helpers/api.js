const logs = require('../Helpers/logs.js')
const pool = require('../helpers/pool.js')
const dotenv = require('dotenv')


const server = dnode({

    deleteData: async function (id, cb) {
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
    },
    // updateData: async function (data, UUID, cb) {

    //     var transactionID = UUID;
    //     var connection = await pool.pool_current.getConnection();
    
    //     logs.logTransaction(`${transactionID} START UPDATE`);
    //     try {
    //         await connection.beginTransaction();
    
    //         Object.keys(data).forEach(keys => {
    //             logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
    //         });
    
    //         const query = `
    //         UPDATE Appointments.appointments
    //         SET DoctorMainSpecialty = "${data.DoctorMainSpecialty}",
    //         HospitalName = "${data.HospitalName}",
    //         HospitalCity = "${data.HospitalCity}",
    //         HospitalRegionName = "${data.HospitalRegionName}",
    //         Status = "${data.Status}",
    //         Type = "${data.Type}",
    //         IsVirtual = ${data.IsVirtualInt},
        
    //         TimeQueued = CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
    //         QueueDate = CAST('${data.QueueDate}' as DATETIME),
    //         StartTime = CAST('1999-01-01 ${data.StartTime}' as DATETIME),
    //         EndTime = CAST('1999-01-01 ${data.EndTime}' as DATETIME)
        
    //         WHERE AppointmentID = "${data.id}"
    //         `;
    //         await connection.query(query);
    //         logs.logTransaction(`${transactionID} COMMIT UPDATE`);
    //         await connection.commit();
    //     } catch (err) {
    //         logs.logTransaction(`${transactionID} ABORT UPDATE`);
    //         await connection.rollback()
    //         pool.pool_main.releaseConnection();
    //     }
    
        // var transactionID = logs.generateUUID();
        // var connection = await pool.pool_main.getConnection();
    
        // logs.logTransaction(`${transactionID} START UPDATE`);
        // try {
        //     await connection.beginTransaction();
    
        //     Object.keys(data).forEach(keys => {
        //         logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
        //     });
    
        //     const query = `
        //     UPDATE Appointments.appointments
        //     SET DoctorMainSpecialty = "${data.DoctorMainSpecialty}",
        //     HospitalName = "${data.HospitalName}",
        //     HospitalCity = "${data.HospitalCity}",
        //     HospitalRegionName = "${data.HospitalRegionName}",
        //     Status = "${data.Status}",
        //     Type = "${data.Type}",
        //     IsVirtual = ${data.IsVirtualInt},
        
        //     TimeQueued = CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
        //     QueueDate = CAST('${data.QueueDate}' as DATETIME),
        //     StartTime = CAST('1999-01-01 ${data.StartTime}' as DATETIME),
        //     EndTime = CAST('1999-01-01 ${data.EndTime}' as DATETIME)
        
        //     WHERE AppointmentID = "${data.id}"
        //     `;
        //     await connection.query(query);
        //     logs.logTransaction(`${transactionID} COMMIT UPDATE`);
        //     await connection.commit();
        // } catch (err) {
        //     logs.logTransaction(`${transactionID} ABORT UPDATE`);
        //     await connection.rollback()
        //     pool.pool_main.releaseConnection();
        // }
    }    
);

server.listen(5004);