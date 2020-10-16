"use strict";
let KTDatatablesExtensionsKeytable = function() {

    // $('#kt_view_modal').modal('show');
    let modal = $('#kt_view_modal');

    let initAppUserTable = function() {

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

                $('#kt_view_modal .object-field-first_name').html(user.first_name);
                $('#kt_view_modal .object-field-last_name').html(user.last_name);
                $('#kt_view_modal .object-field-email_address').html(user.email_address);
                $('#kt_view_modal .object-field-city').html(user.city);
                $('#kt_view_modal .object-field-state').html(user.state);
                $('#kt_view_modal .object-field-notifications').html(user.notifications);
                $('#kt_view_modal .object-field-registration_type').html(user.registration_type);
                $('#kt_view_modal .object-field-active').html(user.active);
                $('#kt_view_modal .object-field-created_at').html( formatDate(user.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(user.updated_at) );

                //load user information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${user.first_name} ${user.last_name} (App User ID: ${user.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-user').on('click', function(e) {
                e.preventDefault();

                //get user object
                let user_id = $(e.currentTarget).data('user-id');
                let user = getRowData(user_id);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${user.first_name} ${user.last_name} (App User ID: ${user.id})`);

                //fill form with content from user row
                $('#kt_object_add-edit_modal form input[name=first_name]').val(user.first_name);
                $('#kt_object_add-edit_modal form input[name=last_name]').val(user.last_name);
                $('#kt_object_add-edit_modal form input[name=email_address]').val(user.email_address);
                $('#kt_object_add-edit_modal form input[name=city]').val(user.city);
                $('#kt_object_add-edit_modal form input[name=state]').val(user.state);
                $('#kt_object_add-edit_modal form input[name=notifications]').val(user.notifications);
                $('#kt_object_add-edit_modal form input[name=registration_type]').val(user.registration_type);

                if( user.active === true ){
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

                    let obj = getFormData();

                    if( obj.active === "on" ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    console.log("save [EDIT to] user obj: ", obj);

                    //add the user
                    $.ajax({
                        method: "PUT",
                        url: `/appuser/${user_id}`,
                        data: obj,
                        success: function(res) {
                            //reset form
                            resetForm();

                            //hide this, re-fetch and redraw table
                            $('#kt_object_add-edit_modal').modal('hide');

                            //refresh the data
                            table.ajax.reload(function() {
                                initTableHandlers();
                            });
                        },
                        error: function(e) {
                            console.error(e);
                        }
                    });
                });

                $('.cancel-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    //close and reset form
                    $('#kt_object_add-edit_modal').modal('hide');
                    resetForm();
                });

                //show the modal
                $('#kt_object_add-edit_modal').modal('show');
            });

            $('.add-user').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New App User`);
                $('#kt_object_add-edit_modal').modal('show');

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    let obj = getFormData();

                    if( obj.active === "on" ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    console.log("new user obj: ", obj);

                    //add the user
                    $.ajax({
                        method: "POST",
                        url: `/appuser`,
                        data: obj,
                        success: function(res) {
                            //reset form
                            resetForm();

                            //hide this, re-fetch and redraw table
                            $('#kt_object_add-edit_modal').modal('hide');

                            //refresh the data
                            table.ajax.reload(function() {
                                initTableHandlers();
                            });
                        },
                        error: function(e) {
                            console.error(e);
                        }
                    });
                });

                $('.cancel-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    $('#kt_object_add-edit_modal').modal('hide');
                    resetForm();
                });
            });

            $('.remove-user').on('click', function(e) {
                e.preventDefault();

                let user_id = $(e.currentTarget).data('user-id');
                let row_id = `user-${user_id}`;

                console.log( `remove app user id?: ${user_id}` );

                //delete the user
                $.ajax({
                    method: "DELETE",
                    url: `/appuser/${user_id}?_csrf=${window._csrf}`,
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

            //request uri
            ajax: "/appuser",

            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `user-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "first_name" },
                { "data": "last_name" },
                { "data": "email_address" },
                { "data": "city" },
                { "data": "state" },
                { "data": "notifications" },
                { "data": "registration_type" },
                { "data": "active" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            //TODO: after editing users: the click handlers don't work
            // --add disable/activate user quick button -- as a per-row toggle button
            // --add send forgotpassword email quick button

            columnDefs: [
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
                    render: function(data, type, user, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item edit-user" href="#" data-user-id=${user.id}><i class="la la-edit"></i> Edit App User</a>
                                <a class="dropdown-item remove-user" href="#" data-user-id=${user.id}><i class="la la-remove"></i> Delete App User</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-user" title="View All Details" data-user-id=${user.id}>
                          <i class="la la-eye"></i>
                        </a>`;
                    }
                }
            ]
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
            $('#kt_object_add-edit_modal form input[name=first_name]').val('');
            $('#kt_object_add-edit_modal form input[name=last_name]').val('');
            $('#kt_object_add-edit_modal form input[name=email_address]').val('');
            $('#kt_object_add-edit_modal form input[name=city]').val('');
            $('#kt_object_add-edit_modal form input[name=state]').val('');
            $('#kt_object_add-edit_modal form input[name=registration_type]').val('');
            $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
        };

        table.on( 'init', function(e, settings, json ) {
            initTableHandlers();
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            initAppUserTable();
        }
    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
});