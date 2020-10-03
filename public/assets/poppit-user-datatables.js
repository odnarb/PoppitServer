"use strict";
let KTDatatablesExtensionsKeytable = function() {

    // $('#kt_view_modal').modal('show');
    let modal = $('#kt_view_modal');

    let initUserTable = function() {

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

                // $('#kt_view_modal .object-field-name').html(user.name);
                // $('#kt_view_modal .object-field-description').html(user.description);
                // $('#kt_view_modal .object-field-address').html(user.address);
                // $('#kt_view_modal .object-field-city').html(user.city);
                // $('#kt_view_modal .object-field-state').html(user.state);
                // $('#kt_view_modal .object-field-zip').html(user.zip);

                //load user information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${user.name} (User ID: ${user.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-user').on('click', function(e) {
                e.preventDefault();

                //get user object
                let user_id = $(e.currentTarget).data('user-id');
                let user = getRowData(user_id);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${user.name} (User ID: ${user.id})`);

                //fill form with content from user row
                // $('#kt_object_add-edit_modal form input[name=name]').val(user.name);
                // $('#kt_object_add-edit_modal form input[name=description]').val(user.description);
                // $('#kt_object_add-edit_modal form input[name=address]').val(user.address);
                // $('#kt_object_add-edit_modal form input[name=city]').val(user.city);
                // $('#kt_object_add-edit_modal form input[name=state]').val(user.state);
                // $('#kt_object_add-edit_modal form input[name=zip]').val(user.zip);

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    let user = getFormData();

                    console.log("user obj: ", user);

                    //add the user
                    $.ajax({
                        method: "PUT",
                        url: `/user/${user_id}`,
                        data: $('.user-add-edit-form').serializeArray(),
                        success: function(res) {
                            //reset form
                            resetForm();

                            //hide this, re-fetch and redraw table
                            $('#kt_object_add-edit_modal').modal('hide');

                            //refresh the data
                            table.ajax.reload();
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

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New User`);
                $('#kt_object_add-edit_modal').modal('show');

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    let user = getFormData();

                    console.log("new user obj: ", user);

                    //add the user
                    $.ajax({
                        method: "POST",
                        url: `/user`,
                        data: user,
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

                console.log( `remove user id?: ${user_id}` );

                //delete the user
                $.ajax({
                    method: "DELETE",
                    url: `/user/${user_id}`,
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
            ajax: "/user",

            //tell datatables that our structure is in obj.companies
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `user-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "name" },
                { "data": "description" },
                { "data": "address" },
                { "data": "city" },
                { "data": "state" },
                { "data": "zip" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            columnDefs: [
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
                                <a class="dropdown-item edit-user" href="#" data-user-id=${user.id}><i class="la la-edit"></i> Edit User</a>
                                <a class="dropdown-item remove-user" href="#" data-user-id=${user.id}><i class="la la-remove"></i> Delete User</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-user" title="View All Details" data-user-id=${user.id}>
                          <i class="la la-eye"></i>
                        </a>`;
                    }
                }
            ]
        });

        let getRowData = function(id) {
            //drill in to get the row id from the event
            let row_id = `user-${id}`;
            return table.row(`#${row_id}`).data();
        };

        let getFormData = function() {
            let userFormData = $('.user-add-edit-form').serializeArray();

            //loop through and prepare as a user object
            let user = {};
            userFormData.forEach(function(item) {
                user[item.name] = item.value;
            });
            return user;
        };

        let resetForm = function() {
            $('#form-user-name').val('');
            $('#form-user-description').val('');
            $('#form-user-address').val('');
            $('#form-user-city').val('');
            $('#form-user-state').val('');
            $('#form-user-zip').val('');
        };

        table.on( 'init', function(e, settings, json ) {
            initTableHandlers();
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            initUserTable();
        }
    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
});