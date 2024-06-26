const fs = require('fs');
const dotenv = require('dotenv')
const https = require('https')
var request = require('request');
const axios = require('axios');

dotenv.config();

const recovery = {
    perform_recovery: async function () {
        var database_name = process.env.SERVER_NAME;
        var server_ip;
        switch (database_name) {
            case 'Main':
                server_ip = [process.env.LOG_INTERNAL_IP_1, process.env.LOG_INTERNAL_IP_2];
                break;
            case 'Luzon':
            case 'VisMin':
                server_ip = process.env.LOG_INTERNAL_IP_0;
                break;
            default:
                break;
        }
        
        // Define the URL of the server and the path to the text file
        const filePath = '/get_log';

        var last_checkpoint = '';
        var start_recover_index = "No Start Index";
        
        const file = fs.readFileSync('./logs/logs.txt', (err, data) => {
            if (err) {
                fs.writeFile('./logs/logs.txt', '', (err, data) => {
                    if (err) {
                    }
                    console.log('created log file');
                })
            } else {
                console.log('log file exists');
            }
            throw err;
        });
        const lines = file.toString().split('\n');
        console.log(lines);
        
        for (var index = lines.length - 1; index >= 0; index--) {
            const split = lines[index].split('|')
            if (split[1] == 'CHECKPOINT') {
                last_checkpoint = split[0];
                break;
            }
        }

        console.log("LAST CHECKPOINT: ", last_checkpoint);

        if (database_name == 'Main') {
            
            var start_uuid;
            var data = {};
            // Make an HTTP GET request to retrieve the text file
            request.get(server_ip[0]+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const lines = body.split('\n');
    
                    for (var index = lines.length - 1; index >= 0; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index = index;
                            break;
                        }                
                    }
    
                    console.log("START RECOVERY INDEX: " + start_recover_index);

                    console.log('START RECOVERY LUZON', last_checkpoint);

                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split('|')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            console.log('START TRANSACTION ID# ', start_uuid)
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        console.log('RECOVERING INSERT ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/insert_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    case "DELETE":
                                        console.log('RECOVERING DELETE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/delete_solo`, data
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "UPDATE":
                                        console.log('RECOVERING DELETE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/update_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            console.log('ABORT TRANSACTION ID# ', start_uuid)
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            console.log('RECOVERING CHECKPOINT ID# ', split[0])
                            start_uuid = '';
                            data = {};
                        } else {
                            data[split[1]] = split[2];
                        }   
                    }
                    console.log('END RECOVERY LUZON', last_checkpoint);
                } else {
                    console.log('LUZON SERVER SEEMS TO BE OFFLINE');
                    console.log('RECOVERY FAILED');
                }
            });
            request.get(server_ip[1]+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const lines = body.split('\n');

                    for (var index = lines.length - 1; index >= 0; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index = index;
                            break;
                        }                
                    }
    
                    console.log("START RECOVERY INDEX: " + start_recover_index);

                    console.log('START RECOVERY VISMIN', last_checkpoint);

                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split('|')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            console.log('START TRANSACTION ID# ', start_uuid)
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        console.log('RECOVERING INSERT ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/insert_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    case "DELETE":
                                        console.log('RECOVERING DELETE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/delete_solo`, data
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "UPDATE":
                                        console.log('RECOVERING DELETE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/update_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            console.log('ABORT TRANSACTION ID# ', start_uuid)
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            console.log('RECOVERING CHECKPOINT ID# ', split[0])
                            start_uuid = '';
                            data = {};
                        } else {
                            data[split[1]] = split[2];
                        }   
                    }
                    console.log('END RECOVERY VISMIN', last_checkpoint);
                } else {
                    console.log('VISMIN SERVER SEEMS TO BE OFFLINE');
                    console.log('RECOVERY FAILED');
                }
            });

        } else {
            
            var start_uuid;
            var data = {};
            // Make an HTTP GET request to retrieve the text file
            request.get(server_ip+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const lines = body.split('\n');

                    console.log("LINES OF RECOVERY: ", lines.length);
    
                    for (var index = lines.length - 1; index >= 0; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index =  index;
                            break;
                        }  
                    }
                    
                    console.log("START RECOVERY INDEX: " + start_recover_index);
                    
                    console.log('START RECOVERY', last_checkpoint);

                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split('|')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            console.log(`START TRANSACTION ${split[2]} ID# `, start_uuid)
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        console.log('RECOVERING INSERT ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/insert_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    case "DELETE":
                                        console.log('RECOVERING DELETE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/delete_solo`, data
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "UPDATE":
                                        console.log('RECOVERING UPDATE ID# ', split[0])
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_CURRENT}/update_solo`, data
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            console.log('ABORT TRANSACTION ID# ', start_uuid)
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            console.log('RECOVERING CHECKPOINT ID# ', split[0])
                            start_uuid = '';
                            data = {};
                        } else {
                            console.log(`SAVING DATA ${split[1]}`, split[2], 'FOR RECOVERY')
                            data[split[1]] = split[2];
                        }
                    }
                    console.log('END RECOVERY', last_checkpoint);
                } else {
                    console.log('MAIN SERVER SEEMS TO BE OFFLINE');
                    console.log('RECOVERY FAILED');
                }
            });
        }
    }
}

module.exports = recovery;