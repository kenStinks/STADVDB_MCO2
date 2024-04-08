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
            $(this).remove(); //delete on user's end

            //TODO: Delete in server (soft delete is safer)
            console.log($(this).attr('id') + " has been deleted.")
        }
    })
});