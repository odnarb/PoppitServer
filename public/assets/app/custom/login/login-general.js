"use strict";

// Class Definition
var KTLoginGeneral = function() {

    var login = $('#kt_login');

    var showErrorMsg = function(form, type, msg) {
        var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

        form.find('.alert').remove();
        alert.prependTo(form);
        //alert.animateClass('fadeIn animated');
        KTUtil.animateClass(alert[0], 'fadeIn animated');
        alert.find('span').html(msg);
    }

    // Private Functions
    var displaySignUpForm = function() {
        login.removeClass('kt-login--forgot');
        login.removeClass('kt-login--signin');

        var thisForm = login.find('.kt-login__signup form');
        thisForm.find('.alert').remove();
        thisForm.clearForm();
        thisForm.validate().resetForm();

        login.addClass('kt-login--signup');
        KTUtil.animateClass(login.find('.kt-login__signup')[0], 'flipInX animated');
    }

    var displaySignInForm = function() {
        login.removeClass('kt-login--forgot');
        login.removeClass('kt-login--signup');

        var thisForm = login.find('.kt-login__signin form');
        thisForm.find('.alert').remove();
        thisForm.clearForm();
        thisForm.validate().resetForm();

        login.addClass('kt-login--signin');
        KTUtil.animateClass(login.find('.kt-login__signin')[0], 'flipInX animated');
        //login.find('.kt-login__signin').animateClass('flipInX animated');
    }

    var displayForgotForm = function() {
        login.removeClass('kt-login--signin');
        login.removeClass('kt-login--signup');

        var thisForm = login.find('.kt-login__forgot form');
        thisForm.find('.alert').remove();
        thisForm.clearForm();
        thisForm.validate().resetForm();

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

        $('#kt_login_signup_cancel').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });
    }

    var handleSignInFormSubmit = function() {
        $('#kt_login_signin_submit').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: '/user/login',
                success: function(res, status, xhr, $form) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    form.find('.alert').remove();
                    window.location.href = "/";
                },
                error: function(res,error){
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    if( res.responseJSON.reason == "not_active" ) {
                        showErrorMsg(form, 'danger', 'Your account has not been activated yet. Please click the activation link in the email we sent. <a href="#">Resend activation email.</a>');
                    } else {
                        showErrorMsg(form, 'danger', 'Incorrect username or password. Please try again.');
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

            form.validate({
                rules: {
                    fullname: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    },
                    rpassword: {
                        equalTo: "#password"
                    },
                    agree: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: '/user/signup',
                success: function(response, status, xhr, $form) {
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    form.clearForm();
                    form.validate().resetForm();

                    // display signup form
                    displaySignInForm();
                    var signInForm = login.find('.kt-login__signin form');
                    signInForm.clearForm();
                    signInForm.validate().resetForm();

                    showErrorMsg(signInForm, 'success', 'Thank you. To complete your registration please check your email.');
                },
                error: function(res,error){
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( res.responseJSON.reason == "email_already_taken" ) {
                        showErrorMsg(form, 'danger', 'That email address is already in use.');
                    } else if( res.responseJSON.reason == "no_params_sent"){
                        showErrorMsg(form, 'danger', 'Please refresh the page and try signing up again.');
                    } else if( res.responseJSON.reason == "no_first_name" ) {
                        showErrorMsg(form, 'danger', 'Please provide your full name.');
                    } else if( res.responseJSON.reason == "no_last_name" ) {
                        showErrorMsg(form, 'danger', 'Please provide your full name.');
                    } else if( res.responseJSON.reason == "no_email" ) {
                        showErrorMsg(form, 'danger', 'Please provide your email address.');
                    } else if( res.responseJSON.reason == "no_password" ) {
                        showErrorMsg(form, 'danger', 'Please provide your password.');
                    } else if( res.responseJSON.reason == "no_rpassword" ) {
                        showErrorMsg(form, 'danger', 'Please confirm your password.');
                    } else if( res.responseJSON.reason == "password_mismatch" ) {
                        showErrorMsg(form, 'danger', 'Please make sure your passwords match.');
                    } else {
                        showErrorMsg(form, 'danger', 'We were unable to process your request. Please try again later.');
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
                    email: {
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
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    form.clearForm(); // clear form
                    form.validate().resetForm(); // reset validation states

                    // display signup form
                    displaySignInForm();
                    var signInForm = login.find('.kt-login__signin form');
                    signInForm.clearForm();
                    signInForm.validate().resetForm();

                    showErrorMsg(signInForm, 'success', 'Password recovery instructions have been sent to your email.');
                }, error: function(res,error){
                    btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    if( res.responseJSON.reason == "not_active" ) {
                        showErrorMsg(form, 'danger', 'Your account has not been activated yet. Please click the activation link in the email we sent. <a href="#">Resend activation email.</a>');
                    } else {
                        showErrorMsg(form, 'danger', 'We were unable to process your request. Please try again later.');
                    }
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
        }
    };
}();

// Class Initialization
jQuery(document).ready(function() {
    KTLoginGeneral.init();
});