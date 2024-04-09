//jquery when the document is ready
$(document).ready(function(){
    console.log("Hello World!")

    $('#edit_button').on("click", function(){
        $('body').toggleClass("edit");
        $('body').removeClass("delete");

    })

    $('#delete_button').on("click", function(){
        $('body').toggleClass("delete");
        $('body').removeClass("edit");
    })

    $('.table_entry').on("click", function(){
        
        if ($('body').hasClass('delete')){
            //update popup
            var id = $(this).attr('id');

            $('#delete_entry > .AppointmentID').text(id);
            $('#delete_entry > .PatientID').text($("#"+id+' > .PatientID').text());
            $('#delete_entry > .ClinicID').text($("#"+id+' > .ClinicID').text());
            $('#delete_entry > .DoctorID').text($("#"+id+' > .DoctorID').text());
            $('#delete_entry > .Status').text($("#"+id+' > .Status').text());
            $('#delete_entry > .TimeQueued').text($("#"+id+' > .TimeQueued').text());
            $('#delete_entry > .QueueDate').text($("#"+id+' > .QueueDate').text());
            $('#delete_entry > .StartTime').text($("#"+id+' > .StartTime').text());
            $('#delete_entry > .EndTime').text($("#"+id+' > .EndTime').text());
            $('#delete_entry > .Type').text($("#"+id+' > .Type').text());
            $('#delete_entry > .isVirtual').text($("#"+id+' > .isVirtual').text());
            
            //show popup
            $('.shadow').removeClass('hide')
            $('.delete_popup').removeClass('hide')
        } else if ($('body').hasClass('edit')){
            var id = $(this).attr('id');

            $('#edit_entry > .AppointmentID').text(id);
            $('#edit_entry > #PatientID').val($("#"+id+' > .PatientID').text());
            $('#edit_entry > #ClinicID').val($("#"+id+' > .ClinicID').text());
            $('#edit_entry > #DoctorID').val($("#"+id+' > .DoctorID').text());
            $('#edit_entry > #Status').val($("#"+id+' > .Status').text());

            $('#edit_entry > #TimeQueued').val(timeToGeneral($("#"+id+' > .TimeQueued').text()));
            $('#edit_entry > #QueueDate').val(makeDate($("#"+id+' > .QueueDate').text()));
            $('#edit_entry > #StartTime').val(timeToGeneral($("#"+id+' > .StartTime').text()));
            $('#edit_entry > #EndTime').val(timeToGeneral($("#"+id+' > .EndTime').text()));


            $('#edit_entry > #Type').val($("#"+id+' > .Type').text());
            $('#edit_entry > #isVirtual').prop('checked', $("#"+id+' > .isVirtual').text().trim()=='done');
            
            //show popup
            $('.shadow').removeClass('hide')
            $('.edit_popup').removeClass('hide')
        }
    })

    $('#confirm_edit').on('click', function(){
        var id = $('#edit_entry > .AppointmentID').text();
        edited_entry = {
            AppointmentID: id,
            PatientID: $('#edit_entry > #PatientID').val(),
            ClinicID: $('#edit_entry > #ClinicID').val(),
            DoctorID: $('#edit_entry > #DoctorID').val(),
            Status: $('#edit_entry > #Status').val(),
            TimeQueued: $('#edit_entry > #TimeQueued').val(),
            QueueDate: $('#edit_entry > #QueueDate').val(),
            StartTime: $('#edit_entry > #StartTime').val(),
            EndTime:$('#edit_entry > #EndTime').val(),
            Type:$('#edit_entry > #Type').val(),
            isVirtual: $('#edit_entry > #isVirtual').val(),
            isDeleted: false,
        }

        //TODO: update in DB
        
        //update for user end
        $("#"+id+' > .PatientID').text(edited_entry.PatientID);
        $("#"+id+' > .ClinicID').text(edited_entry.ClinicID);
        $("#"+id+' > .DoctorID').text(edited_entry.DoctorID);
        $("#"+id+' > .Status').text(edited_entry.Status);

        $("#"+id+' > .TimeQueued').text(timeToAMPM(edited_entry.TimeQueued));
        $("#"+id+' > .QueueDate').text(edited_entry.QueueDate);
        $("#"+id+' > .StartTime').text(timeToAMPM(edited_entry.StartTime));
        $("#"+id+' > .EndTime').text(timeToAMPM(edited_entry.EndTime));

        $("#"+id+' > .Type').text(edited_entry.Type);



        if(edited_entry.isVirtual=='on'){
            $("#"+id+' > .isVirtual').text('done');
        } else {$("#"+id+' > .isVirtual').text('close');}
        
        

        console.log(edited_entry)

        //close window
        $('.shadow').addClass('hide')
        $('.edit_popup').addClass('hide')
    })

    $('.cancel').on('click', function(){
        $('.shadow').addClass('hide')
        $('.delete_popup').addClass('hide')
        $('.edit_popup').addClass('hide')

        console.log('deletion canceled');
    })

    $('#confirm_delete').on('click', function(){
        id = $('#delete_entry > .AppointmentID').text()
        $("#"+id).remove() //remove for user

        //TODO: Delete entry with matching ID in DB

        console.log(id+' has been deleted');

        //close window
        $('.shadow').addClass('hide')
        $('.delete_popup').addClass('hide')
    })
});

function makeDate(x){
    var date = new Date(x);

    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);

    return date.getFullYear()+"-"+(month)+"-"+(day) ;
}

function timeToGeneral(date){
    var hours = Number(date.match(/^(\d+)/)[1]);
    var minutes = Number(date.match(/:(\d+)/)[1]);
    var AMPM = date.match(/\s(.*)$/)[1];
    if(AMPM == "PM" && hours<12) hours = hours+12;
    if(AMPM == "AM" && hours==12) hours = hours-12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;
    return sHours + ":" + sMinutes;

}

function timeToAMPM(date) {
    var hours = Number(date.match(/^(\d+)/)[1]);
    var minutes = Number(date.match(/:(\d+)$/)[1]);
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }