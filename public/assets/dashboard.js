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
    $('#user_context_reset').click( function(e){
        e.preventDefault();

        $('.show-user-context-details').html('');
        $('.set-user-context').show();
        $('.show-user-context').hide();
    });

    $('#user_context_submit').click( function(e){
        e.preventDefault();

        var validUser = false
        var user_id = $('.set-user-context input').val();
        if( user_id !== '' ){
            validUser = true
        }

        if(validUser){
            $.ajax({
                method: "GET",
                url: `/user/setcontext/${user_id}?_csrf=${window._csrf}`,
                success: function(res) {
                    console.log("User context res: ", res)

                    if(res.success === true) {
                        $('.show-user-context-details').html(`${res.user.name} (id:${res.user.id})`);
                        $('.set-user-context').hide();
                        $('.show-user-context').show();
                        $('.set-user-context input').removeClass('is-invalid');
                    } else {
                        $('.set-user-context input').addClass('is-invalid');
                    }
                },
                error: function(e) {
                    $('.set-user-context').show();
                    $('.show-user-context').hide();
                    $('.set-user-context input').addClass('is-invalid');
                }
            });
        } else {
            $('.set-user-context').show();
            $('.show-user-context').hide();
            $('.set-user-context input').addClass('is-invalid');
        }
    });
}

initChangeCompanyContext()
initChangeUserContext()