const controller = {

    getIndex: async function (req, res) {
        var table = []
        //test table values
        const statOptions = ["Complete", "Queued", "NoShow", "Cancel", "Serving", "Skip", "Admitted"]
        const typeOptions = ["Consultation", "Inpatient"]

        for(var i=0; i<50; i++){
            table.push({
                AppointmentID: i+1000,
                PatientID: i+2000,
                ClinicID: i+3000,
                DoctorID: i+4000,
                Status: statOptions[i%7],
                TimeQueued: "1:00PM",
                StartTime: "12:00AM",
                EndTime:"6:00AM",
                Type:typeOptions[i%2],
                isVirtual: (i%2 == 0)

            })
        }
        
        data = {
            table: table
        }
        
        res.render('index', data);
    },
    
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;