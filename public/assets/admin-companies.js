"use strict";
let KTDatatablesExtensionsKeytable = function() {

    let modal = $('#kt_view_modal');

    let checkToggle = function(val){
        return val === "on" || val === 1 || val === true;
    };

    let initTable = function() {

        let initTableHandlers = function() {
            // clear click handlers
            $('.view-company').off();
            $('.edit-company').off();
            $('.add-company').off();
            $('.remove-company').off();
            $('.submit-edit-add-form').off();
            $('.cancel-edit-add-form').off();


            //bind everything needed
            $('.view-company').on('click', function(e) {
                e.preventDefault();

                //get company object
                let company_id = $(e.currentTarget).data('company-id');
                let company = getRowData(company_id);

                $('#kt_view_modal .object-field-name').html(company.name);
                $('#kt_view_modal .object-field-description').html(company.description);
                $('#kt_view_modal .object-field-address1').html(company.address1);
                $('#kt_view_modal .object-field-address2').html(company.address2);
                $('#kt_view_modal .object-field-city').html(company.city);
                $('#kt_view_modal .object-field-state_province').html(company.state_province);
                $('#kt_view_modal .object-field-postal_code').html(company.postal_code);
                $('#kt_view_modal .object-field-country').html(company.country);
                $('#kt_view_modal .object-field-country_code').html(company.country_code);
                $('#kt_view_modal .object-field-active').html(company.active);
                $('#kt_view_modal .object-field-created_at').html( formatDate(company.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(company.updated_at) );

                //load company information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${company.name} (Company ID: ${company.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-company').on('click', function(e) {
                e.preventDefault();

                //get company object
                let company_id = $(e.currentTarget).data('company-id');
                let company = getRowData(company_id);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${company.name} (Company ID: ${company.id})`);

                //fill form with content from company row
                $('#kt_object_add-edit_modal form input[name=name]').val(company.name);
                $('#kt_object_add-edit_modal form input[name=description]').val(company.description);
                $('#kt_object_add-edit_modal form input[name=address1]').val(company.address1);
                $('#kt_object_add-edit_modal form input[name=address2]').val(company.address2);
                $('#kt_object_add-edit_modal form input[name=city]').val(company.city);
                $('#kt_object_add-edit_modal form input[name=state_province]').val(company.state_province);
                $('#kt_object_add-edit_modal form input[name=postal_code]').val(company.postal_code);
                // $('#kt_object_add-edit_modal form input[name=country_code]').val(company.country_code);

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
                            name: {
                                required: true,
                                maxlength: 80
                            },
                            description: {
                                required: false,
                                maxlength: 1000
                            },
                            address1: {
                                required: true,
                                maxlength: 255
                            },
                            city: {
                                required: true,
                                maxlength: 80
                            },
                            state_province: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
                            },
                            postal_code: {
                                required: true,
                                number: true,
                                maxlength: 5,
                                minlength: 5
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    console.log("company obj: ", obj);

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the company
                    $.ajax({
                        method: "PUT",
                        url: `/admin/companies/${company_id}`,
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
                    resetForm();
                });

                //show the modal
                $('#kt_object_add-edit_modal').modal('show');
            });

            $('.add-company').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New Company`);
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
                            name: {
                                required: true,
                                maxlength: 80
                            },
                            description: {
                                required: false,
                                maxlength: 1000
                            },
                            address1: {
                                required: true,
                                maxlength: 255
                            },
                            city: {
                                required: true,
                                maxlength: 80
                            },
                            state_province: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
                            },
                            postal_code: {
                                required: true,
                                digits: true,
                                maxlength: 5,
                                minlength: 5
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    console.log("new company obj: ", obj);

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the company
                    $.ajax({
                        method: "POST",
                        url: `/admin/companies`,
                        data: obj,
                        success: function(res) {
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

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
                            btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

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

            $('.remove-company').on('click', function(e) {
                e.preventDefault();

                let company_id = $(e.currentTarget).data('company-id');
                let row_id = `company-${company_id}`;

                console.log( `remove company id?: ${company_id}` );

                //delete the company
                $.ajax({
                    method: "DELETE",
                    url: `/admin/companies/${company_id}?_csrf=${window._csrf}`,
                    success: function(res) {
                        console.log("company deleted!: ", res);

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

        let table = $('#companies-list').DataTable({
            processing: true,
            responsive: true,
            select: true,
            deferRender: true,
            pagingType: 'full_numbers',
            order: [[ 7, "desc" ]],

            //request uri
            ajax: "/admin/companies",

            //tell datatables that our structure is in obj.companies
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `company-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },             //0
                { "data": "name" },           //1
                { "data": "description" },    //2
                { "data": "address1" },       //3
                { "data": "address2" },       //4
                { "data": "city" },           //5
                { "data": "state_province" }, //6
                { "data": "postal_code" },    //7
                { "data": "country" },        //8
                { "data": "country_code" },   //9
                { "data": "active" },         //10
                { "data": "created_at" },     //11
                { "data": "updated_at" },     //12
                { "data": "actions" }         //13
            ],

            columnDefs: [
                {
                    targets: [ 0,2,3,4,7,8,9,10,11,12 ],
                    visible: false,
                    searchable: false
                },
                /*
                //render time stamp
                {
                    targets: -3,
                    render: function(data, type, company, meta) {
                        return `${formatDate(company.created_at)}`;
                    }
                },
                //render time stamp
                {
                    targets: -2,
                    render: function(data, type, company, meta) {
                        return `${formatDate(company.updated_at)}`;
                    }
                },*/
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    searchable: false,
                    render: function(data, type, company, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item edit-company" href="#" data-company-id=${company.id}><i class="la la-edit"></i> Edit Company</a>
                                <a class="dropdown-item remove-company" href="#" data-company-id=${company.id}><i class="la la-remove"></i> Delete Company</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-company" title="View All Details" data-company-id=${company.id}>
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
            let row_id = `company-${id}`;
            return table.row(`#${row_id}`).data();
        };

        let getFormData = function() {
            let formDataObj = $('.company-add-edit-form').serializeArray();

            //loop through and prepare as a company object
            let obj = {};
            formDataObj.forEach(function(item) {
                obj[item.name] = item.value;
            });
            return obj;
        };

        let resetForm = function() {
            $('#kt_object_add-edit_modal .view-object-header').html( '' );
            $('#kt_object_add-edit_modal form input[name=name]').val('');
            $('#kt_object_add-edit_modal form input[name=description]').val('');
            $('#kt_object_add-edit_modal form input[name=address1]').val('');
            $('#kt_object_add-edit_modal form input[name=address2]').val('');
            $('#kt_object_add-edit_modal form input[name=city]').val('');
            $('#kt_object_add-edit_modal form input[name=state_province]').val('');
            $('#kt_object_add-edit_modal form input[name=postal_code]').val('');
            // $('#kt_object_add-edit_modal form input[name=country_code]').val('');
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