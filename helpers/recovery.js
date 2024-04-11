const fs = require('fs');
const dotenv = require('dotenv')
const https = require('https')
var request = require('request');

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
            case 'Vismin':
                server_ip = process.env.LOG_INTERNAL_IP_0;
                break;
            default:
                break;
        }
        
        const file = fs.createWriteStream("data.txt");

        // Define the URL of the server and the path to the text file
        const filePath = '/logs.txt';

        var last_checkpoint = '';
        var start_recover_index;
        
        fs.readFile('./logs/logs.txt', (error, data) => {
            if (error) {
                console.log(error);
                throw error;
            }
            const lines = data.toString().split('\n');
            console.log(lines);
            
            for (var index = lines.length - 1; index >= lines.length; index--) {
                const split = lines[index].split('|')
                if (split[1] == 'CHECKPOINT') {
                    last_checkpoint = split[0];
                    return;
                }
            }
        });

        if (database_name == 'Main') {
            
            var start_uuid;
            var current_checkpoint;
            var data = {};
            // Make an HTTP GET request to retrieve the text file
            request.get(`${server_ip[0]}`+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var txt = body.toString();
                    const lines = txt.toString().split('\n');
    
                    // fs.readFile(txt, (error, data) => {
                    //     if (error) {
                    //         throw error;
                    //     }
                    //     const lines = data.toString().split('\n');
                    //     console.log(lines);
    
                    //     // for (let i = lines.length - 1; i >= 0; i--) {
                    //     //     // Process each line here (or call a callback function)
                    //     //     // For demonstration, we'll just print the line
                    //     //     console.log(lines[i]);
                
                    //     //     // You can also pass each line to a callback function
                    //     //     // callback(null, lines[i]);
                
                    //     //     // Alternatively, you can collect lines in an array and pass them to the callback function
                    //     //     // reverseLines.push(lines[i]);
                    //     // }
                    // })
                    console.log(lines.length);
    
                    for (var index = lines.length - 1; index >= lines.length; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index = lines.length - index + 1;
                            console.log("lines: " + start_recover_index);
                            return;
                        }                
                    }
    
                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split(' ')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/insert_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    case "UPDATE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/delete_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "DELETE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/update_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            start_uuid = '';
                            data = {};
                        } else {
                            data[split[1]] = data.split[2];
                        }   
                    }
                }
            
            });

            request.get(`${server_ip[1]}`+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var txt = body.toString();
                    const lines = txt.toString().split('\n');
    
                    // fs.readFile(txt, (error, data) => {
                    //     if (error) {
                    //         throw error;
                    //     }
                    //     const lines = data.toString().split('\n');
                    //     console.log(lines);
    
                    //     // for (let i = lines.length - 1; i >= 0; i--) {
                    //     //     // Process each line here (or call a callback function)
                    //     //     // For demonstration, we'll just print the line
                    //     //     console.log(lines[i]);
                
                    //     //     // You can also pass each line to a callback function
                    //     //     // callback(null, lines[i]);
                
                    //     //     // Alternatively, you can collect lines in an array and pass them to the callback function
                    //     //     // reverseLines.push(lines[i]);
                    //     // }
                    // })
                    console.log(lines.length);
    
                    for (var index = lines.length - 1; index >= lines.length; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index = lines.length - index + 1;
                            console.log("lines: " + start_recover_index);
                            return;
                        }                
                    }
    
                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split(' ')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/insert_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    case "UPDATE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/delete_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "DELETE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/update_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            start_uuid = '';
                            data = {};
                        } else {
                            data[split[1]] = data.split[2];
                        }   
                    }
                }
            
            });
        } else {
            fs.readFile('./logs/logs.txt', (error, data) => {
                if (error) {
                    console.log(error);
                    throw error;
                }
                const lines = data.toString().split('\n');
                console.log(lines);
                
                for (var index = lines.length - 1; index >= lines.length; index--) {
                    const split = lines[index].split('|')
                    if (split[1] == 'CHECKPOINT') {
                        last_checkpoint = split[0];
                        return;
                    }
                }
            });
            
            var start_uuid;
            var current_checkpoint;
            var data = {};
            // Make an HTTP GET request to retrieve the text file
            request.get(server_ip[0]+filePath, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var txt = body.toString();
                    const lines = txt.toString().split('\n');
    
                    // fs.readFile(txt, (error, data) => {
                    //     if (error) {
                    //         throw error;
                    //     }
                    //     const lines = data.toString().split('\n');
                    //     console.log(lines);
    
                    //     // for (let i = lines.length - 1; i >= 0; i--) {
                    //     //     // Process each line here (or call a callback function)
                    //     //     // For demonstration, we'll just print the line
                    //     //     console.log(lines[i]);
                
                    //     //     // You can also pass each line to a callback function
                    //     //     // callback(null, lines[i]);
                
                    //     //     // Alternatively, you can collect lines in an array and pass them to the callback function
                    //     //     // reverseLines.push(lines[i]);
                    //     // }
                    // })
                    console.log(lines.length);
    
                    for (var index = lines.length - 1; index >= lines.length; index--) {
                        const split = lines[index].split('|')
                        if (split[1] == 'CHECKPOINT' && last_checkpoint == split[0]) {
                            start_recover_index = lines.length - index + 1;
                            console.log("lines: " + start_recover_index);
                            return;
                        }                
                    }
    
                    for (let index = start_recover_index; index < lines.length; index++) {
                        const split = lines[index].split(' ')
                        if (split[1] == 'START') {
                            start_uuid = split[0];
                            data = {};
                        } else if (split[1] == 'COMMIT') {
                            if (start_uuid == split[0]) {
                                const checkpoint = lines[index + 1].split('|')
                                
                                switch (split[2]) {
                                    case "INSERT":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/insert_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    case "UPDATE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/delete_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));    
                                        break;
                                    case "DELETE":
                                        data.transactionID = split[0];
                                        data.checkpointID = checkpoint[0];
                                        await axios.post(`${process.env.VM_INTERNAL_IP_0}/update_solo`, formData
                                        ).then(res => console.log(res)
                                        ).catch(err => console.log(err));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                data = {};
                            }
                        } else if (split[1] == 'ABORT') {
                            start_uuid = '';
                            data = {};
                        } else if (split[1] == 'CHECKPOINT') {
                            start_uuid = '';
                            data = {};
                        } else {
                            data[split[1]] = data.split[2];
                        }   
                    }
                }
            });
        }
    }
}

module.exports = recovery;