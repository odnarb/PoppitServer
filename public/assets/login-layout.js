"use strict";

var intlPhone

// Class Definition
var KTLoginGeneral = function() {

    var login = $('#kt_login');

    var showFormMsg = function(form, type, msg) {
        var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
            <p></p>\</div>');

        if(form === null){
            form = $(".kt-login__logo")
            form.find('.alert').remove();
            alert.appendTo(form);
        } else {
            form.find('.alert').remove();
            alert.prependTo(form);
        }

        KTUtil.animateClass(alert[0], 'fadeIn animated');
        alert.find('p').html(msg);
    }

    const params = new URLSearchParams(window.location.search);

    var hideAllForms = function () {
        login.removeClass('kt-login--newpassword');
        login.removeClass('kt-login--forgot');
        login.removeClass('kt-login--signup');
        login.removeClass('kt-login--signupP2');
        login.removeClass('kt-login--signin');
    }

    // Private Functions
    var displayNewPasswordForm = function() {
        hideAllForms();

        login.addClass('kt-login--newpassword');
        KTUtil.animateClass(login.find('.kt-login__newpassword')[0], 'flipInX animated');
    }

    var displaySignUpForm = function() {
        hideAllForms();

        login.addClass('kt-login--signup');
        KTUtil.animateClass(login.find('.kt-login__signup')[0], 'flipInX animated');
    }

    var displaySignUpFormP2 = function() {
        hideAllForms()

        login.addClass('kt-login--signupP2');
        KTUtil.animateClass(login.find('.kt-login__signupP2')[0], 'flipInY animated');
    }

    var displaySignInForm = function() {
        hideAllForms()

        login.addClass('kt-login--signin');
        KTUtil.animateClass(login.find('.kt-login__signin')[0], 'flipInX animated');
        //login.find('.kt-login__signin').animateClass('flipInX animated');
    }

    var displayForgotForm = function() {
        hideAllForms();

        login.addClass('kt-login--forgot');
        //login.find('.kt-login--forgot').animateClass('flipInX animated');
        KTUtil.animateClass(login.find('.kt-login__forgot')[0], 'flipInX animated');

    }

    var handleFormSwitch = function() {
        $('#kt_login_forgot').click(function(e) {
            e.preventDefault();
            displayForgotForm();
        });

        $('#kt_login_forgot_cancel').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });

        $('#kt_login_signup').click(function(e) {
            e.preventDefault();
            displaySignUpForm();
        });

        $('#kt_login_signup_page2').click(function(e) {
            e.preventDefault();

            //validate form 1 and move on if the validation works
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    first_name: {
                        required: true
                    },
                    last_name: {
                        required: true
                    },
                    gender: {
                        required: true
                    },
                    email_address: {
                        required: true,
                        email: true
                    },
                    phone: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            } else {
                displaySignUpFormP2();
            }
        });

        $('#kt_login_signup_cancel').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });
        $('#kt_login_signup_cancel2').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });
    }

    var handleNewPasswordFormSubmit = function() {
        $('#kt_login_newpassword_submit').click(function(e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    password1: {
                        required: true
                    },
                    password2: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: '/user/newpassword',
                dataType : 'json', // data type
                data : form.serialize(),
                success: function(response, status, xhr, $form) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( response.success === true ){
                        form.clearForm()
                        displaySignInForm();
                        let signInForm = login.find('.kt-login__signin form');
                        showFormMsg(signInForm, 'success', 'Password reset successfully!');
                    } else {
                        showFormMsg(form, 'danger', 'Passwords do not match or are empty. Please try again.');
                    }
                },
                error: function( res, textStatus, errorThrown ) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                }
            });
        });
    }

    var handleSignInFormSubmit = function() {
        $('#kt_login_signin_submit').click(function(e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    email_address: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                showFormMsg(form, 'danger', 'Missing username, password or both. Please try again.');
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: '/user/login',
                dataType : 'json', // data type
                data : form.serialize(),
                success: function(response, status, xhr, $form) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( response.success === true ){
                        window.location = "/";
                    } else {
                        showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                    }
                },
                error: function( res, textStatus, errorThrown ) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( res.responseJSON === undefined ){
                        showFormMsg( form, 'danger', 'A problem has occurred please contact support.');
                    } else if( res.responseJSON.reason == "needs_pw_change" ){
                        displayNewPasswordForm()
                    } else if( res.responseJSON.reason == "no_user" ){
                        showFormMsg(form, 'danger', 'Incorrect username or password. Please try again.');
                    } else if( res.responseJSON.reason == "no_active" ){
                        showFormMsg(form, 'danger', 'Please check your inbox and confirm your email address.');
                    } else {
                        showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                    }
                }
            });
        });
    }

    var handleSignUpFormSubmit = function() {
        $('#kt_login_signup_submit').click(function(e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');
            var form2 = $("#kt_login_signup_page2").closest('form');

            form.validate({
                rules: {
                    language: {
                        required: true
                    },
                    city: {
                        required: true
                    },
                    state_province: {
                        required: true
                    },
                    country: {
                        required: true
                    },
                    password: {
                        required: true
                    },
                    rpassword: {
                        required: true,
                        equalTo: "#password"
                    },
                    agree: {
                        required: true
                    }
                },
                messages: {
                    rpassword: {
                        equalTo: "Passwords must match"
                    },
                    agree: {
                        required: "Please review and agree to the terms to continue."
                    }
                }

            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            let serializedData = $('.kt-login__signup .kt-form').serialize()

            let formData = Object.fromEntries(new URLSearchParams( serializedData ))
            const params = new URLSearchParams(window.location.search);

            formData.phone = intlPhone.getNumber()

            form.ajaxSubmit({
                url: '/user/signup',
                data: formData,
                success: function(response, status, xhr, $form) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    form.clearForm();
                    form.validate().resetForm();

                    form2.clearForm();
                    form2.validate().resetForm();

                    // display signup form
                    displaySignInForm();
                    var signInForm = login.find('.kt-login__signin form');
                    signInForm.clearForm();
                    signInForm.validate().resetForm();

                    showFormMsg(signInForm, 'success', 'Thank you. To complete your registration please check your email.');
                },
                error: function( res, textStatus, errorThrown ) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( res.responseJSON === undefined ) {
                        showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                    } else if( res.responseJSON.reason == "duplicate_email" ) {
                        showFormMsg(null, 'danger', 'That email address is already in use in our system.');
                    } else {
                        showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                    }
                }
            });
        });
    }

    var handleForgotFormSubmit = function() {
        $('#kt_login_forgot_submit').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    email_address: {
                        required: true,
                        email: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: '/user/forgotpassword',
                success: function(response, status, xhr, $form) { 
                        btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false); // remove
                        form.clearForm(); // clear form
                        form.validate().resetForm(); // reset validation states

                        // display signup form
                        displaySignInForm();
                        var signInForm = login.find('.kt-login__signin form');
                        signInForm.clearForm();
                        signInForm.validate().resetForm();

                        showFormMsg(signInForm, 'success', 'Password recovery instructions have been sent to your email.');
                },
                error: function( res, textStatus, errorThrown ) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    showFormMsg(form, 'danger', 'A problem has occurred please contact support.');
                }
            });
        });
    }

    // Public Functions
    return {
        // public functions
        init: function() {
            handleFormSwitch();
            handleSignInFormSubmit();
            handleSignUpFormSubmit();
            handleForgotFormSubmit();
            handleNewPasswordFormSubmit();
        }
    };
}();

// Class Initialization
jQuery(document).ready(function() {
    KTLoginGeneral.init();

    var phone = document.querySelector("input[name=phone]");
    intlPhone = window.intlTelInput(phone, {
        utilsScript: "/assets/telUtils.js",
        separateDialCode: true
    });

    //lazy load the terms.. only load when the modal is loaded
    let loadedTerms = false
    $("#terms_and_conditions_modal").on('shown.bs.modal', function(e) {
        //update the modal content once
        if( loadedTerms === false ){
            $.ajax('/terms.html', {
                success: res => {
                    $("#terms_and_conditions_modal .innerTerms").html(res)
                    loadedTerms = true
                }
            })
        }
    })
});
