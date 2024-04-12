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
            $('#delete_entry > .DoctorMainSpecialty').text($("#"+id+' > .DoctorMainSpecialty').text());
            $('#delete_entry > .HospitalName').text($("#"+id+' > .HospitalName').text());
            $('#delete_entry > .HospitalCity').text($("#"+id+' > .HospitalCity').text());
            $('#delete_entry > .HospitalRegionName').text($("#"+id+' > .HospitalRegionName').text());
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
            $('#edit_entry > #DoctorMainSpecialty').val($("#"+id+' > .DoctorMainSpecialty').text());
            $('#edit_entry > #HospitalName').val($("#"+id+' > .HospitalName').text());
            $('#edit_entry > #HospitalCity').val($("#"+id+' > .HospitalCity').text());
            $('#edit_entry > #HospitalRegionName').val($("#"+id+' > .HospitalRegionName').text());
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

    $('#add_button').on('click', function(){

        $('#add_entry > #DoctorMainSpecialty').val('');
        $('#add_entry > #HospitalName').val('');
        $('#add_entry > #HospitalCity').val('');
        $('#add_entry > #HospitalRegionName').val('');
        $('#add_entry > #Status').val('');

        $('#add_entry > #TimeQueued').val('');
        $('#add_entry > #QueueDate').val('');
        $('#add_entry > #StartTime').val('');
        $('#add_entry > #EndTime').val('');

        $('#add_entry > #Type').val('');
        $('#add_entry > #isVirtual').prop('checked', false);

        $('.shadow').removeClass('hide')
        $('.add_popup').removeClass('hide')
    })


    $('#search_button').on('click', function(){
        $('#search_entry > #DoctorMainSpecialty').val('');
        $('#search_entry > #HospitalName').val('');
        $('#search_entry > #HospitalCity').val('');
        $('#search_entry > #HospitalRegionName').val('');
        $('#search_entry > #Status').val('');

        $('#search_entry > #TimeQueued').val('');
        $('#search_entry > #QueueDate').val('');
        $('#search_entry > #StartTime').val('');
        $('#search_entry > #EndTime').val('');

        $('#search_entry > #Type').val('');
        $('#search_entry > #isVirtual').val('');

        $('.shadow').removeClass('hide')
        $('.search_popup').removeClass('hide')
    });

    $('#confirm_add').on('click', function(){
        //add to database
        added_entry = {
            DoctorMainSpecialty: $('#add_entry > #DoctorMainSpecialty').val(),
            HospitalName: $('#add_entry > #HospitalName').val(),
            HospitalCity: $('#add_entry > #HospitalCity').val(),
            HospitalRegionName: $('#add_entry > #HospitalRegionName').val(),
            Status: $('#add_entry > #Status').val(),
            TimeQueued: $('#add_entry > #TimeQueued').val(),
            QueueDate: $('#add_entry > #QueueDate').val(),
            StartTime: $('#add_entry > #StartTime').val(),
            EndTime:$('#add_entry > #EndTime').val(),
            Type:$('#add_entry > #Type').val(),
            isVirtual: $('#add_entry > #isVirtual').prop('checked'),
        }
        
        $.ajax({
            type: "POST",
            url: '/add',
            data: added_entry,
        });

        //send to last page
        window.location.href = "/?page=1";

    });

    $('#confirm_edit').on('click', function(){

        var id = $('#edit_entry > .AppointmentID').text();
        edited_entry = {
            id: id,
            DoctorMainSpecialty: $('#edit_entry > #DoctorMainSpecialty').val(),
            HospitalName: $('#edit_entry > #HospitalName').val(),
            HospitalCity: $('#edit_entry > #HospitalCity').val(),
            HospitalRegionName: $('#edit_entry > #HospitalRegionName').val(),
            Status: $('#edit_entry > #Status').val(),
            TimeQueued: $('#edit_entry > #TimeQueued').val(),
            QueueDate: $('#edit_entry > #QueueDate').val(),
            StartTime: $('#edit_entry > #StartTime').val(),
            EndTime:$('#edit_entry > #EndTime').val(),
            Type:$('#edit_entry > #Type').val(),
            isVirtual: $('#edit_entry > #isVirtual').prop('checked'),
        }

        //TODO: update in DB
        $.ajax({
            type: "POST",
            url: '/update',
            data: edited_entry,
          });

        //update for user end
        $("#"+id+' > .DoctorMainSpecialty').text(edited_entry.DoctorMainSpecialty);
        $("#"+id+' > .HospitalName').text(edited_entry.HospitalName);
        $("#"+id+' > .HospitalCity').text(edited_entry.HospitalCity);
        $("#"+id+' > .HospitalRegionName').text(edited_entry.HospitalRegionName);
        $("#"+id+' > .Status').text(edited_entry.Status);

        $("#"+id+' > .TimeQueued').text(timeToAMPM(edited_entry.TimeQueued));
        $("#"+id+' > .QueueDate').text(edited_entry.QueueDate);
        $("#"+id+' > .StartTime').text(timeToAMPM(edited_entry.StartTime));
        $("#"+id+' > .EndTime').text(timeToAMPM(edited_entry.EndTime));

        $("#"+id+' > .Type').text(edited_entry.Type);

        if(edited_entry.isVirtual){
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
        $('.add_popup').addClass('hide')
        $('.search_popup').addClass('hide')
        console.log('deletion canceled');
    })

    $('#confirm_delete').on('click', function(){
        id = $('#delete_entry > .AppointmentID').text()
        $("#"+id).remove() //remove for user

        //TODO: Delete entry with matching ID in DB
        data = {
            id: id
        }

        $.ajax({
            type: "POST",
            url: '/delete',
            data: data,
          });

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
    if (!date) return '';
    var hours = Number(date.match(/^(\d+)/)[1]);
    var minutes = Number(date.match(/:(\d+)/)[1]);
    var AMPM = date.match(/\s(.*)$/)[1];
    if(AMPM == "PM" && hours<12) hours = hours+12;
    if(AMPM == "AM" && hours==12) hours = hours-12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if(hours<10) sHours = "0" + sHours;
    if(minutes<10) sMinutes = "0" + sMinutes;
    return sHours + ":" + sMinutes + AMPM;
}

function timeToAMPM(date) {
    if (!date) return '';
    var hours = Number(date.match(/^(\d+)/)[1]);
    var minutes = Number(date.match(/:(\d+)$/)[1]);
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}