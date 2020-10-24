"use strict";
let KTDatatablesExtensionsKeytable = function() {

    // $('#kt_view_modal').modal('show');
    let modal = $('#kt_view_modal');

    let checkToggle = function(val){
        return val === "on" || val === 1 || val === true;
    };

    let initTable = function() {

        let initTableHandlers = function() {
            // clear click handlers
            $('.view-user').off();
            $('.edit-user').off();
            $('.add-user').off();
            $('.remove-user').off();
            $('.submit-edit-add-form').off();
            $('.cancel-edit-add-form').off();

            //bind everything needed
            $('.view-user').on('click', function(e) {
                e.preventDefault();

                //get user object
                let user_id = $(e.currentTarget).data('user-id');
                let user = getRowData(user_id);

                $('#kt_view_modal .object-field-company_id').html(user.company_id);
                $('#kt_view_modal .object-field-first_name').html(user.first_name);
                $('#kt_view_modal .object-field-last_name').html(user.last_name);
                $('#kt_view_modal .object-field-email_address').html(user.email_address);
                $('#kt_view_modal .object-field-company_permissions').html(user.company_permissions);
                $('#kt_view_modal .object-field-phone_number').html(user.phone_number);
                $('#kt_view_modal .object-field-company_role').html(user.company_role);
                $('#kt_view_modal .object-field-company_contact').html(user.company_contact);
                $('#kt_view_modal .object-field-active').html(user.active);
                $('#kt_view_modal .object-field-created_at').html( formatDate(user.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(user.updated_at) );

                //load user information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${user.first_name} ${user.last_name} (Company User ID: ${user.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-user').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                //get user object
                let user_id = $(e.currentTarget).data('user-id');
                let user = getRowData(user_id);

                console.log("edit user: ", user);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${user.first_name} ${user.last_name} (Company User ID: ${user.id})`);

                //fill form with content from user row
                $('#kt_object_add-edit_modal form input[name=company_id]').val(user.company_id);
                $('#kt_object_add-edit_modal form input[name=first_name]').val(user.first_name);
                $('#kt_object_add-edit_modal form input[name=last_name]').val(user.last_name);
                $('#kt_object_add-edit_modal form input[name=email_address]').val(user.email_address);
                $(`#kt_object_add-edit_modal form option[value="${user.company_role}"]`).prop('selected', true);
                $('#kt_object_add-edit_modal form input[name=phone_number]').val(user.phone_number);

                if( checkToggle(user.company_contact) ){
                    $('#kt_object_add-edit_modal form input[name=company_contact]').prop('checked', true);
                } else {
                    $('#kt_object_add-edit_modal form input[name=company_contact]').prop('checked', false);
                }

                if( checkToggle(user.active) ){
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', true);
                } else {
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
                }

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    var btn = $(this);
                    var form = $(this).closest('form');

                    form.validate({
                        rules: {
                            company_id: {
                                required: true,
                                maxlength: 32,
                                digits: true
                            },
                            first_name: {
                                required: true,
                                maxlength: 80
                            },
                            last_name: {
                                required: true,
                                maxlength: 80
                            },
                            email_address: {
                                required: true,
                                email: true,
                                maxlength: 255
                            },
                            phone_number: {
                                required: true,
                                phoneUS: true
                            },
                            company_role: {
                                required: true
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    if( checkToggle(obj.active) ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }
                    if( checkToggle(obj.company_contact) ){
                        obj.company_contact = 1;
                    } else {
                        obj.company_contact = 0;
                    }

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the user
                    $.ajax({
                        method: "PUT",
                        url: `/companyuser/${user_id}`,
                        data: obj,
                        success: function(res) {
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                            //hide this, re-fetch and redraw table
                            $('#kt_object_add-edit_modal').modal('hide');

                            //refresh the data
                            table.ajax.reload(function() {
                                initTableHandlers();
                            });
                        },
                        error: function(e) {
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                            console.error(e);
                        }
                    });
                });

                $('.cancel-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    //close and reset form
                    $('#kt_object_add-edit_modal').modal('hide');
                });

                //show the modal
                $('#kt_object_add-edit_modal').modal('show');
            });

            $('.add-user').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New Company User`);
                $('#kt_object_add-edit_modal').modal('show');

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    var btn = $(this);
                    var form = $(this).closest('form');

                    form.validate({
                        rules: {
                            company_id: {
                                required: true,
                                maxlength: 32,
                                digits: true
                            },
                            first_name: {
                                required: true,
                                maxlength: 80
                            },
                            last_name: {
                                required: true,
                                maxlength: 80
                            },
                            email_address: {
                                required: true,
                                email: true,
                                maxlength: 255
                            },
                            phone_number: {
                                required: true,
                                phoneUS: true
                            },
                            company_role: {
                                required: true
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    if( checkToggle(obj.active) ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }
                    if( checkToggle(obj.company_contact) ){
                        obj.company_contact = 1;
                    } else {
                        obj.company_contact = 0;
                    }

                    console.log("new user obj: ", obj);

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the user
                    $.ajax({
                        method: "POST",
                        url: `/companyuser`,
                        data: obj,
                        success: function(res) {
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                            //hide this, re-fetch and redraw table
                            $('#kt_object_add-edit_modal').modal('hide');

                            //refresh the data
                            table.ajax.reload(function() {
                                initTableHandlers();
                            });
                        },
                        error: function(e) {
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                            console.error(e);
                        }
                    });
                });

                $('.cancel-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    $('#kt_object_add-edit_modal').modal('hide');
                });
            });

            $('.remove-user').on('click', function(e) {
                e.preventDefault();

                let user_id = $(e.currentTarget).data('user-id');
                let row_id = `user-${user_id}`;

                console.log( `remove Company User id?: ${user_id}` );

                //delete the user
                $.ajax({
                    method: "DELETE",
                    url: `/companyuser/${user_id}?_csrf=${window._csrf}`,
                    success: function(res) {
                        console.log("user deleted!: ", res);

                        //remove the row from the table
                        table.row(`#${row_id}`).remove().draw();

                        //show toast to help undo or to go see in the trash
                    },
                    error: function(e) {
                        console.error(e);
                    }
                });
            });
        }; //end initTableHandlers()

        let table = $('#kt_table_1').DataTable({
            processing: true,
            responsive: true,
            select: true,
            deferRender: true,
            pagingType: 'full_numbers',
            order: [[ 7, "desc" ]],

            buttons: [
                'print',
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                {
                    extend: 'pdfHtml5',
                    orientation: 'landscape'
                }
            ],

            //request uri
            ajax: "/companyuser",

            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `user-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "company_id" },
                { "data": "first_name" },
                { "data": "last_name" },
                { "data": "email_address" },
                { "data": "phone_number" },
                { "data": "company_role" },
                { "data": "company_contact" },
                { "data": "active" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            // --add disable/activate user quick button -- as a per-row toggle button
            // --add send forgotpassword email quick button

            columnDefs: [
                {
                    "targets": [ 5,6,7 ],
                    "visible": false,
                    "searchable": false
                },
                //render time stamp
                {
                    targets: -3,
                    render: function(data, type, user, meta) {
                        return `${formatDate(user.created_at)}`;
                    }
                },
                //render time stamp
                {
                    targets: -2,
                    render: function(data, type, user, meta) {
                        return `${formatDate(user.updated_at)}`;
                    }
                },
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    searchable: false,
                    render: function(data, type, user, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item edit-user" href="#" data-user-id=${user.id}><i class="la la-edit"></i> Edit Company User</a>
                                <a class="dropdown-item remove-user" href="#" data-user-id=${user.id}><i class="la la-remove"></i> Delete Company User</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-user" title="View All Details" data-user-id=${user.id}>
                          <i class="la la-eye"></i>
                        </a>`;
                    }
                }
            ]
        });

        $('#export_print').on('click', function(e) {
            e.preventDefault();
            table.button(0).trigger();
        });

        $('#export_copy').on('click', function(e) {
            e.preventDefault();
            table.button(1).trigger();
        });

        $('#export_excel').on('click', function(e) {
            e.preventDefault();
            table.button(2).trigger();
        });

        $('#export_csv').on('click', function(e) {
            e.preventDefault();
            table.button(3).trigger();
        });

        $('#export_pdf').on('click', function(e) {
            e.preventDefault();
            table.button(4).trigger();
        });

        let formatDate = function(dateStamp){
            let date = dateStamp.split('T')[0];
            let time = dateStamp.split('T')[1].substr(0,8);
            return `${date} ${time}`;
        };

        let getRowData = function(id) {
            //drill in to get the row id from the event
            let row_id = `user-${id}`;
            return table.row(`#${row_id}`).data();
        };

        let getFormData = function() {
            let formDataObj = $('.user-add-edit-form').serializeArray();

            //loop through and prepare as a user object
            let obj = {};
            formDataObj.forEach(function(item) {
                obj[item.name] = item.value;
            });
            return obj;
        };

        let resetForm = function() {
            $('#kt_object_add-edit_modal .view-object-header').html( '' );
            $('#kt_object_add-edit_modal form input[name=company_id]').val('');
            $('#kt_object_add-edit_modal form input[name=first_name]').val('');
            $('#kt_object_add-edit_modal form input[name=last_name]').val('');
            $('#kt_object_add-edit_modal form input[name=email_address]').val('');
            $('#kt_object_add-edit_modal form input[name=phone_number]').val('');
            $('#kt_object_add-edit_modal form input[name=company_role]').val('');
            $('#kt_object_add-edit_modal form input[name=company_contact]').prop('checked', false);
            $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
            $(`#kt_object_add-edit_modal form option[value="none"]`).prop('selected', true);

        };

        table.on( 'init', function(e, settings, json ) {
            initTableHandlers();
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            initTable();
        }
    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
});