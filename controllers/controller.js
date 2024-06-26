const dotenv = require('dotenv')
const logs = require('../helpers/logs.js')
const poolHelper = require('../helpers/pool.js')
const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs');


dotenv.config();

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

async function getData(query, limit) {
    
    try {
        const connection = await mysql.createPool(poolHelper.pool_main).getConnection();

        await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection.query('START TRANSACTION');
        const [rows] = await connection.query(
        `
        SELECT * 
        FROM Appointments.appointments
        WHERE IsVirtual = ${query.IsVirtual} AND
        AppointmentID LIKE ${query.AppointmentID} AND
        DoctorMainSpecialty LIKE ${query.DoctorMainSpecialty} AND
        HospitalName LIKE ${query.HospitalName} AND
        HospitalCity LIKE ${query.HospitalCity} AND
        HospitalRegionName LIKE ${query.HospitalRegionName}
        LIMIT ${limit}
        OFFSET ${(query.page-1)*limit}
        `
        )
        await connection.query('COMMIT');
        connection.release();
        return rows;
    } catch (error) {
        console.log("PRIMARY DATABAS IS OFFLINE");
        await connection.query('COMMIT');
    }

    try {
        const connection_1 = await mysql.createPool(poolHelper.pool_luzon).getConnection()
        const connection_2 = await mysql.createPool(poolHelper.pool_vismin).getConnection()
        await connection_1.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await connection_2.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        
        await connection_1.query('START TRANSACTION');
        await connection_2.query('START TRANSACTION');
        var newLimit = Math.ceil(limit/2)
        var [row0] = await connection_1.query(
            `
            SELECT * 
            FROM Appointments.appointments
            LIMIT ${newLimit}
            OFFSET ${(query.page-1)*newLimit}
            `
            )
        
        var [row1] = await connection_2.query(
        `
        SELECT * 
        FROM Appointments.appointments
        LIMIT ${newLimit}
        OFFSET ${(query.page-1)*newLimit}
        `
        )
        await connection_1.query('END TRANSACTION');
        await connection_2.query('END TRANSACTION');
        console.log(row0.concat(row1));
        connection_1.release();
        connection_2.release();
        return row0.concat(row1);
    } catch (error) {
        console.log("SECONDARY DATABASES ARE OFFLINE");
        await poolHelper.pool_luzon.query('END TRANSACTION');
        await poolHelper.pool_vismin.query('END TRANSACTION');
    }
}

async function deleteData(id) {

    var transactionID = logs.generateUUID();
    var formData = {id: id};
    formData.transactionID = transactionID;
    var checkpointID = logs.generateUUID();
    formData.checkpointID = checkpointID;

    console.log(process.env.VM_INTERNAL_IP_0);
    await axios.post(`${process.env.VM_INTERNAL_IP_0}/delete_solo`, formData
    ).catch(err => console.log('DELETE: ', 'NODE MAIN OFFLINE'));

    console.log(process.env.VM_INTERNAL_IP_1);
    await axios.post(`${process.env.VM_INTERNAL_IP_1}/delete_solo`, formData
    ).catch(err => console.log('DELETE: ', 'NODE LUZON OFFLINE'));

    console.log(process.env.VM_INTERNAL_IP_2);
    await axios.post(`${process.env.VM_INTERNAL_IP_2}/delete_solo`, formData
    ).catch(err => console.log('DELETE: ', 'NODE VISMIN OFFLINE'));

    // var connection = await selectRegion(region).getConnection();
    
    // logs.logTransaction(`${transactionID} START DELETE`);
    // try {
    //     await connection.beginTransaction();
    
    //     var data = await connection.query(`SELECT * FROM ${process.env.MYSQL_DB_TABLE} WHERE AppointmentID = "${id}"`);

    //     Object.keys(data).forEach(keys => {
    //         logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
    //     });

    //     logs.logTransaction(`${transactionID} COMMIT DELETE`);
    // } catch (error) {
    //     logs.logTransaction(`${transactionID} ABORT DELETE`);
    //     await connection.rollback()
    //     pool.pool_main.releaseConnection();
    // }
}

async function updateData(data) {

    var transactionID = logs.generateUUID();
    var formData = data;
    formData.transactionID = transactionID;
    var checkpointID = logs.generateUUID();
    formData.checkpointID = checkpointID;

    try {
        const connection = await mysql.createPool(poolHelper.pool_current).getConnection();
        
        const ids = await connection.query(
            `
            SELECT * 
            FROM Appointments.appointments
            WHERE AppointmentID = "${data.id}"
            `
        );

        formData.ClinicID = ids.ClinicID;
        formData.DoctorID = ids.DoctorID;
        formData.PatientID = ids.PatientID;
        
        connection.release()
    } catch (error) {
        
    }

    console.log(process.env.VM_INTERNAL_IP_0);
    axios.post(`${process.env.VM_INTERNAL_IP_0}/update_solo`, formData
    ).catch(err => console.log('UPDATE: ', 'NODE MAIN OFFLINE ', err));
    
    console.log(process.env.VM_INTERNAL_IP_1);
    axios.post(`${process.env.VM_INTERNAL_IP_1}/update_solo`, formData
    ).catch(err => console.log('UPDATE: ', 'NODE LUZON OFFLINE ', err));

    console.log(process.env.VM_INTERNAL_IP_2);
    axios.post(`${process.env.VM_INTERNAL_IP_2}/update_solo`, formData
    ).catch(err => console.log('UPDATE: ', 'NODE VISMIN OFFLINE ', err));

    // axios({
    //     method: 'post',
    //     host: 'localhost',
    //     url: '/update_solo',
    //     post: 3000,
    //     data: {
    //     DoctorMainSpecialty: data.DoctorMainSpecialty,
    //     HospitalName: data.HospitalName,
    //     HospitalCity: data.HospitalCity,
    //     HospitalRegionName: data.HospitalRegionName,
    //     Status: data.Status,
    //     Type: data.Type,
    //     IsVirtual: data.IsVirtualInt,
    
    //     TimeQueued: data.TimeQueued,
    //     QueueDate: data.QueueDate,
    //     StartTime: data.StartTime,
    //     EndTime: data.EndTime,

    //     transactionID: transactionID,
    // }})

    // const d = dnode.connect(process.env.DNODE_PORT);

    // wildcard.serverUrl = 'http://localhost:3000';
    // (async () => {
    //     await endpoints.updateData(data, transactionID, 1);
    //     console.log(msg); // Prints "Hello from process 1"
    // })();

    // d.on('remote', function (remote) {
    //     remote.updateData(data, transactionID, function (s) {
    //         d.end();
    //     });
    // })
    
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

async function addData(data) {
    
    var transactionID = logs.generateUUID();
    var formData = data;
    formData.transactionID = transactionID;
    var checkpointID = logs.generateUUID();
    formData.checkpointID = checkpointID;

    console.log(data);

    var AppointmentID = logs.generateUUID();
    formData.AppointmentID = AppointmentID.replace(/-/g,"");
    console.log(formData.AppointmentID);
    var ClinicID = logs.generateUUID();
    formData.ClinicID = ClinicID.replace(/-/g,"");
    var DoctorID = logs.generateUUID();
    formData.DoctorID = DoctorID.replace(/-/g,"");

    console.log(process.env.VM_INTERNAL_IP_0);
    axios.post(`${process.env.VM_INTERNAL_IP_0}/add_solo`, formData
    ).catch(err => console.log('ADD: ', 'NODE MAIN OFFLINE'));

    console.log(process.env.VM_INTERNAL_IP_1);
    axios.post(`${process.env.VM_INTERNAL_IP_1}/add_solo`, formData
    ).catch(err => console.log('ADD: ', 'NODE LUZON OFFLINE'));

    console.log(process.env.VM_INTERNAL_IP_2);
    axios.post(`${process.env.VM_INTERNAL_IP_2}/add_solo`, formData
    ).catch(err => console.log('ADD: ', 'NODE VISMIN OFFLINE'));

    // var connection = await pool.pool_main.getConnection();

    // logs.logTransaction(`${transactionID} START INSERT`);
    // try {
    //     await connection.beginTransaction();

    //     Object.keys(data).forEach(keys => {
    //         logs.logTransaction(`${transactionID} ${keys} ${data[keys]}`);
    //     });

    //     var query = `
    //     INSERT INTO Appointments.appointments 
    //     (DoctorMainSpecialty, HospitalName, HospitalCity, HospitalRegionName, Status, Type, IsVirtual, TimeQueued, QueueDate, StartTime, EndTime, AppointmentID, PatientID, ClinicID, DoctorID, PatientAge, IsHospital, HospitalProvince) VALUES 
    //     ("${data.DoctorMainSpecialty}",
    //     "${data.HospitalName}",
    //     "${data.HospitalCity}",
    //     "${data.HospitalRegionName}",
    //     "${data.Status}",
    //     "${data.Type}",
    //     ${data.IsVirtualInt},
    //     CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
    //     CAST('${data.QueueDate}' as DATETIME),
    //     CAST('1999-01-01 ${data.StartTime}' as DATETIME),
    //     CAST('1999-01-01 ${data.EndTime}' as DATETIME),
    //     REPLACE(uuid(), '-', ''),
    //     REPLACE(uuid(), '-', ''),
    //     REPLACE(uuid(), '-', ''),
    //     REPLACE(uuid(), '-', ''),
    //     20,
    //     1,
    //     ""
    //     );
    //     `
    //     await connection.query(query);
    //     logs.logTransaction(`${transactionID} COMMIT INSERT`);
    //     await connection.commit();
    // } catch (error) {
    //     logs.logTransaction(`${transactionID} ABORT INSERT`);
    //     await connection.rollback()
    //     pool.pool_main.releaseConnection();
    // }


    // const [rows] = await pool.pool_main.query()
}

async function getMax(query){

    try {
        const connection = await mysql.createPool(poolHelper.pool_main).getConnection()

        const [rows] = await connection.query(
        `
        SELECT COUNT(*) as count
        FROM Appointments.appointments
        WHERE IsVirtual = ${query.IsVirtual} AND
        AppointmentID LIKE ${query.AppointmentID} AND
        DoctorMainSpecialty LIKE ${query.DoctorMainSpecialty} AND
        HospitalName LIKE ${query.HospitalName} AND
        HospitalCity LIKE ${query.HospitalCity} AND
        HospitalRegionName LIKE ${query.HospitalRegionName} 
        `  
        )
        return rows;
    } catch (error) {
        
    }
    try {
        const connection_1 = await mysql.createPool(poolHelper.pool_luzon).getConnection()
        const connection_2 = await mysql.createPool(poolHelper.pool_vismin).getConnection()

        const [rows0] = await connection_1.query(
            `
            SELECT COUNT(*) as count
            FROM Appointments.appointments
            WHERE IsVirtual = ${query.IsVirtual} AND
            AppointmentID LIKE ${query.AppointmentID} AND
            DoctorMainSpecialty LIKE ${query.DoctorMainSpecialty} AND
            HospitalName LIKE ${query.HospitalName} AND
            HospitalCity LIKE ${query.HospitalCity} AND
            HospitalRegionName LIKE ${query.HospitalRegionName} 
            `  
        )
        const [rows1] = await connection_2.query(
            `
            SELECT COUNT(*) as count
            FROM Appointments.appointments
            WHERE IsVirtual = ${query.IsVirtual} AND
            AppointmentID LIKE ${query.AppointmentID} AND
            DoctorMainSpecialty LIKE ${query.DoctorMainSpecialty} AND
            HospitalName LIKE ${query.HospitalName} AND
            HospitalCity LIKE ${query.HospitalCity} AND
            HospitalRegionName LIKE ${query.HospitalRegionName} 
            `  
        )
        connection_1.release();
        connection_2.release();
        return rows0.concat(rows1);
    } catch (error) {
        return [];
    }

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

function findNode(region) {
    if (luzonRegions.includes(region)) {   
        return 'Luzon';
    } else {
        return 'VisMin';  
    }
}

async function selectNode(region) {
    switch (findNode(req.body.HospitalRegionName)) {
        case "Luzon":
            return await poolHelper.pool_luzon.getConnection()
        case "VisMin":
            return await poolHelper.pool_vismin.getConnection()
        default:
            return null;
    }
}


const controller = {
    getIndex: async function (req, res) {
        console.log(req.query)

        var query = {
            page: parseInt(req.query.page) || 1,
            IsVirtual: 'IsVirtual',
            AppointmentID: 'AppointmentID',
            DoctorMainSpecialty: 'DoctorMainSpecialty',
            HospitalName: 'HospitalName',
            HospitalCity: 'HospitalCity',
            HospitalRegionName: 'HospitalRegionName',
        }

        if(req.query.AppointmentID){
            query.AppointmentID = `'%${req.query.AppointmentID}%'`
        }
        if(req.query.DoctorMainSpecialty){
            query.DoctorMainSpecialty = `'%${req.query.DoctorMainSpecialty}%'`
        }
        if(req.query.HospitalName){
            query.HospitalName = `'%${req.query.HospitalName}%'`
        }
        if(req.query.HospitalCity){
            query.HospitalCity = `'%${req.query.HospitalCity}%'`
        }
        if(req.query.HospitalRegionName){
            query.HospitalRegionName = `'%${req.query.HospitalRegionName}%'`
        }

        if(req.query.isVirtual){
            if (req.query.isVirtual=='Yes'){
                query.IsVirtual = 1
            }else if (req.query.isVirtual=='No'){
                query.IsVirtual = 0
            }
        } 

        console.log(query)
        
        
        const limit = 10; //entries per page
        var maxpage = await getMax(query); //maximum possible page
        var maxpage = Math.ceil(maxpage[0].count/limit)

        const page = Math.min(Math.max(query.page || 1, 1), maxpage);
        

        const rows = await getData(query,limit);
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

        if(data.isVirtual.localeCompare('true')) 
        {
            data.IsVirtualInt = 1;
        } else {
            data.IsVirtualInt = 0;
        }

        updateData(data)
    },

    deleteID: async function (req, res) {
        const data = req.body
        deleteData(data.id)
        console.log(data)
    },

    addID: async function (req, res) {
        var data = req.body
        
        if(data.isVirtual.localeCompare('true')) 
        {
            data.IsVirtualInt = 1;
        } else {
            data.IsVirtualInt = 0;
        }

        addData(data)
    },

    soloUpdateID: async function (req, res) {
        res.end();
        console.log('Solo Update Begin');

        var data = req.body;

        console.log(data);

        var transactionID = req.body.transactionID;
        var checkpointID = req.body.checkpointID;

        if (process.env.SERVER_NAME == 'Main' || process.env.SERVER_NAME == findNode(req.body.HospitalRegionName)) {
            logs.logTransaction(`${transactionID}|START|UPDATE`);
            try {
                console.log('Solo Update Transaction');
                const connection = await mysql.createPool(poolHelper.pool_current).getConnection();  


                //Read committed because IDs Shouldnt Change
                await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');
                await connection.query('START TRANSACTION');
    
                Object.keys(data).forEach(keys => {
                    if (keys != 'transactionID' && keys != 'checkpointID') {
                        logs.logTransaction(`${transactionID}|${keys}|${data[keys]}`);
                    }
                });

                var isHospital = data.HospitalName ? 0 : 1;

                var query = 
                `
                INSERT INTO Appointments.appointments 
                (AppointmentID, 
                    ClinicID, 
                    DoctorID, 
                    PatientID, 
                    DoctorMainSpecialty, 
                    HospitalName, 
                    HospitalCity, 
                    HospitalRegionName, 
                    Status, 
                    Type, 
                    IsVirtual, 
                    TimeQueued, 
                    QueueDate, 
                    StartTime, 
                    EndTime, 
                    PatientAge, 
                    IsHospital, 
                    HospitalProvince
                ) VALUES 
                ("${data.id}", 
                "${data.ClinicID}", 
                "${data.DoctorID}", 
                "${data.PatientID}",
                "${data.DoctorMainSpecialty}",
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
                0,
                ${isHospital},
                ""
                ) ON DUPLICATE KEY UPDATE
                DoctorMainSpecialty = "${data.DoctorMainSpecialty}",
                HospitalName = "${data.HospitalName}",
                HospitalCity = "${data.HospitalCity}",
                HospitalRegionName = "${data.HospitalRegionName}",
                Status = "${data.Status}",
                Type = "${data.Type}",
                IsVirtual = ${data.IsVirtualInt},
            
                TimeQueued = CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
                QueueDate = CAST('${data.QueueDate}' as DATETIME),
                StartTime = CAST('1999-01-01 ${data.StartTime}' as DATETIME),
                EndTime = CAST('1999-01-01 ${data.EndTime}' as DATETIME),
                PatientAge = 0,
                IsHospital = ${isHospital},
                HospitalProvince = ""
                ;
                `;

                // const query = `
                // UPDATE Appointments.appointments
                // SET DoctorMainSpecialty = "${data.DoctorMainSpecialty}",
                // HospitalName = "${data.HospitalName}",
                // HospitalCity = "${data.HospitalCity}",
                // HospitalRegionName = "${data.HospitalRegionName}",
                // Status = "${data.Status}",
                // Type = "${data.Type}",
                // IsVirtual = ${data.IsVirtualInt},
            
                // TimeQueued = CAST('1999-01-01 ${data.TimeQueued}' as DATETIME),
                // QueueDate = CAST('${data.QueueDate}' as DATETIME),
                // StartTime = CAST('1999-01-01 ${data.StartTime}' as DATETIME),
                // EndTime = CAST('1999-01-01 ${data.EndTime}' as DATETIME)
            
                // WHERE AppointmentID = "${data.id}"
                // `;
                await connection.query(query);
    
                logs.logTransaction(`${transactionID}|COMMIT|UPDATE`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
                await connection.query('COMMIT');
                connection.release();
            } catch (err) {
                console.log(err);
                logs.logTransaction(`${transactionID}|ABORT|UPDATE`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
            }
        } else {
            console.log(`Deleting Data ${data.id} due to server region constraints`);
            try {
                const connection = await mysql.createPool(poolHelper.pool_current).getConnection();  
                
                if ((await connection.query(`SELECT * FROM ${process.env.MYSQL_DB_TABLE} WHERE AppointmentID = "${data.id}"`)).length >= 1) {
                    console.log(`Deletion of Data ${data.id} SUCCESS`);
                } else {
                    console.log(`Deletion of Data ${data.id} FAIL it does not exists`);
                }
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
                connection.release();
            } catch (error) {
                console.log(err);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
            }
        }
    },

    soloDeleteID: async function (req, res) {
        console.log('Solo Delete Begin');
        var id = req.body.id;

        var transactionID = req.body.transactionID;
        var checkpointID = req.body.checkpointID;


        if (process.env.SERVER_NAME == 'Main' || process.env.SERVER_NAME == findNode(req.body.HospitalRegionName)) {
            logs.logTransaction(`${transactionID}|START|DELETE`);
            try {
                console.log('Solo Delete Transaction');

                const connection = await mysql.createPool(poolHelper.pool_current).getConnection();  

                await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');
                await connection.query('START TRANSACTION');
            
                var data = await connection.query(`SELECT * FROM ${process.env.MYSQL_DB_TABLE} WHERE AppointmentID = "${id}"`);
        
                Object.keys(data).forEach(keys => {
                    if (keys != 'transactionID' && keys != 'checkpointID') {
                        logs.logTransaction(`${transactionID}|${keys}|${data[keys]}`);
                    }
                });
        
                logs.logTransaction(`${transactionID}|COMMIT|DELETE`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
                await connection.query('COMMIT');
                connection.release();
            } catch (error) {
                console.log(err);
                logs.logTransaction(`${transactionID}|ABORT|DELETE`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
            }
        }
        
    },
    soloAddID: async function (req, res) {
        console.log('Solo Add Begin');

        var data = req.body;

        var transactionID = req.body.transactionID;
        var checkpointID = req.body.checkpointID;

        if (process.env.SERVER_NAME == 'Main' || process.env.SERVER_NAME == findNode(req.body.HospitalRegionName)) {
            logs.logTransaction(`${transactionID}|START|INSERT`);
            try {
                console.log('Solo Add Transaction');

                const connection = await mysql.createPool(poolHelper.pool_current).getConnection();  

                await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');
                await connection.query('START TRANSACTION');
    
                Object.keys(data).forEach(keys => {
                    if (keys != 'transactionID' && keys != 'checkpointID') {
                        logs.logTransaction(`${transactionID}|${keys}|${data[keys]}`);
                    }
                });
                
                var isHospital = data.HospitalName ? 0 : 1;

                var query = 
                `
                INSERT INTO Appointments.appointments 
                (AppointmentID, 
                    ClinicID, 
                    DoctorID, 
                    PatientID, 
                    DoctorMainSpecialty, 
                    HospitalName, 
                    HospitalCity, 
                    HospitalRegionName, 
                    Status, 
                    Type, 
                    IsVirtual, 
                    TimeQueued, 
                    QueueDate, 
                    StartTime, 
                    EndTime, 
                    PatientAge, 
                    IsHospital, 
                    HospitalProvince
                ) VALUES 
                ("${data.AppointmentID}", 
                "${data.ClinicID}", 
                "${data.DoctorID}", 
                "${data.PatientID}",
                "${data.DoctorMainSpecialty}",
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
                0,
                ${isHospital},
                ""
                );
                `;
                await connection.query(query);
                logs.logTransaction(`${transactionID}|COMMIT|INSERT`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
                await connection.query('COMMIT');
                connection.release();
            } catch (err) {
                console.log(err);
                logs.logTransaction(`${transactionID}|ABORT|INSERT`);
                logs.logTransaction(`${checkpointID}|CHECKPOINT`);
            }    
        }
    },

    getLog: async function(req, res)
    {
        fs.readFile('./logs/logs.txt', (error, data) => {
            if (error) {
                console.log(error);
                throw error;
            }
            res.setHeader('content-type', 'text/plain');
            res.send(data.toString())
        });
    }
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;