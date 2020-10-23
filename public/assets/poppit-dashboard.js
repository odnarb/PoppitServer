let initChangeCompanyContext = function(){
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
}

let initChangeUserContext = function(){
    $('#companyuser_context_reset').click( function(e){
        e.preventDefault();

        $('.show-companyuser-context-details').html('');
        $('.set-companyuser-context').show();
        $('.show-companyuser-context').hide();
    });

    $('#companyuser_context_submit').click( function(e){
        e.preventDefault();

        var validUser = false
        var companyuser_id = $('.set-companyuser-context input').val();
        if( companyuser_id !== '' ){
            validUser = true
        }

        if(validUser){
            $.ajax({
                method: "GET",
                url: `/companyuser/setcontext/${companyuser_id}?_csrf=${window._csrf}`,
                success: function(res) {
                    console.log("User context res: ", res)

                    if(res.success === true) {
                        $('.show-companyuser-context-details').html(`${res.companyuser.name} (id:${res.companyuser.id})`);
                        $('.set-companyuser-context').hide();
                        $('.show-companyuser-context').show();
                        $('.set-companyuser-context input').removeClass('is-invalid');
                    } else {
                        $('.set-companyuser-context input').addClass('is-invalid');
                    }
                },
                error: function(e) {
                    $('.set-companyuser-context').show();
                    $('.show-companyuser-context').hide();
                    $('.set-companyuser-context input').addClass('is-invalid');
                }
            });
        } else {
            $('.set-companyuser-context').show();
            $('.show-companyuser-context').hide();
            $('.set-companyuser-context input').addClass('is-invalid');
        }
    });
}

initChangeCompanyContext()
initChangeUserContext()