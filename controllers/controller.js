const controller = {

    getIndex: async function (req, res) {
        const page = parseInt(req.query.page) || 1
        const limit = 20 //entries per page
        const maxpage = 10 //maximum possible page

        var table = []
        //test table values
        const statOptions = ["Complete", "Queued", "NoShow", "Cancel", "Serving", "Skip", "Admitted"]
        const typeOptions = ["Consultation", "Inpatient"]

        for(var i=page*limit; i<page*limit+limit; i++){
            table.push({
                AppointmentID: i+1000,
                PatientID: i+2000,
                ClinicID: i+3000,
                DoctorID: i+4000,
                Status: statOptions[i%7],
                TimeQueued: "1:00 PM",
                QueueDate: "2001-9-11",
                StartTime: "12:00 AM",
                EndTime:"6:00 AM",
                Type:typeOptions[i%2],
                isVirtual: (i%2 == 0),
                isDeleted: false
            })
        }
        
        data = {
            table: table,

            page: Math.min(Math.max(page, 1), maxpage),
            prev_page: Math.max(page-1, 1),
            next_page: Math.min(page+1, maxpage),
            min_page: 1,
            max_page: 10,

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