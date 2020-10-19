$('#company_context_reset').click( function(e){
    e.preventDefault();

    $('.show-company-context-details').html('');
    $('.set-company-context').show();
    $('.show-company-context').hide();
});

$('#company_context_submit').click( function(e){
    e.preventDefault();

    var validCompany = false
    var company_id = $('.set-company-context input').val();
    if( company_id !== '' ){
        if( parseInt(company_id) > 0 ){
            validCompany = true
        }
    }

    if(validCompany){
        $.ajax({
            method: "GET",
            url: `/company/setcontext/${company_id}?_csrf=${window._csrf}`,
            success: function(res) {
                console.log("Company context res: ", res)

                if(res.success === true) {
                    $('.show-company-context-details').html(`${res.company.name} (id:${res.company.id})`);
                    $('.set-company-context').hide();
                    $('.show-company-context').show();
                    $('.set-company-context input').removeClass('is-invalid');
                } else {
                    $('.set-company-context input').addClass('is-invalid');
                }
            },
            error: function(e) {
                console.error("ERROR SETTING COMPANY CONTEXT: ",e);
                $('.set-company-context').show();
                $('.show-company-context').hide();
                $('.set-company-context input').addClass('is-invalid');
            }
        });
    } else {
        $('.set-company-context').show();
        $('.show-company-context').hide();
        $('.set-company-context input').addClass('is-invalid');
    }
});