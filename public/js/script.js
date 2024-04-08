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
            $('#edit_entry > .Status').text($("#"+id+' > .Status').text());
            $('#edit_entry > .TimeQueued').text($("#"+id+' > .TimeQueued').text());
            $('#edit_entry > .QueueDate').text($("#"+id+' > .QueueDate').text());
            $('#edit_entry > .StartTime').text($("#"+id+' > .StartTime').text());
            $('#edit_entry > .EndTime').text($("#"+id+' > .EndTime').text());
            $('#edit_entry > .Type').text($("#"+id+' > .Type').text());
            $('#edit_entry > .isVirtual').text($("#"+id+' > .isVirtual').text());
            
            //show popup
            $('.shadow').removeClass('hide')
            $('.edit_popup').removeClass('hide')
        }
    })

    $('.cancel').on('click', function(){
        $('.shadow').addClass('hide')
        $('.delete_popup').addClass('hide')
        $('.edit_popup').addClass('hide')

        console.log('deletion canceled');
    })

    $('#confirm_delete').on('click', function(){
        $('.shadow').addClass('hide')
        $('.delete_popup').addClass('hide')

        id = $('#delete_entry > .AppointmentID').text()
        $("#"+id).remove() //remove for user

        //TODO: Delete entry with matching ID in DB

        console.log(id+' has been deleted');
    })
});