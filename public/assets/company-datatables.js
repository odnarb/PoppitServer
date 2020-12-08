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
                $('#kt_view_modal .object-field-address').html(company.address);
                $('#kt_view_modal .object-field-city').html(company.city);
                $('#kt_view_modal .object-field-state').html(company.state);
                $('#kt_view_modal .object-field-zip').html(company.zip);
                $('#kt_view_modal .object-field-country_code').html(company.zip);
                $('#kt_view_modal .object-field-active').html(company.active);
                $('#kt_view_modal .object-field-demo_acct').html(company.demo_acct);
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
                $('#kt_object_add-edit_modal form input[name=address]').val(company.address);
                $('#kt_object_add-edit_modal form input[name=city]').val(company.city);
                $('#kt_object_add-edit_modal form input[name=state]').val(company.state);
                $('#kt_object_add-edit_modal form input[name=zip]').val(company.zip);
                $('#kt_object_add-edit_modal form input[name=country_code]').val(company.country_code);

                if( checkToggle(company.active) ){
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', true);
                } else {
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
                }

                if( checkToggle(company.demo_acct) ){
                    $('#kt_object_add-edit_modal form input[name=demo_acct]').prop('checked', true);
                } else {
                    $('#kt_object_add-edit_modal form input[name=demo_acct]').prop('checked', false);
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
                            name: {
                                required: true,
                                maxlength: 80
                            },
                            description: {
                                required: false,
                                maxlength: 1000
                            },
                            address: {
                                required: true,
                                maxlength: 255
                            },
                            city: {
                                required: true,
                                maxlength: 80
                            },
                            state: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
                            },
                            zip: {
                                required: true,
                                number: true,
                                maxlength: 5,
                                minlength: 5
                            },
                            country_code: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
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

                    if( checkToggle(obj.demo_acct) ) {
                        obj.demo_acct = 1;
                    } else {
                        obj.demo_acct = 0;
                    }

                    console.log("company obj: ", obj);

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the company
                    $.ajax({
                        method: "PUT",
                        url: `/company/${company_id}`,
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
                            address: {
                                required: true,
                                maxlength: 255
                            },
                            city: {
                                required: true,
                                maxlength: 80
                            },
                            state: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
                            },
                            zip: {
                                required: true,
                                digits: true,
                                maxlength: 5,
                                minlength: 5
                            },
                            country_code: {
                                required: true,
                                maxlength: 2,
                                minlength: 2
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    if( obj.active === "on" || obj.active === 1 ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    if( obj.demo_acct === "on" || obj.demo_acct === 1 ) {
                        obj.demo_acct = 1;
                    } else {
                        obj.demo_acct = 0;
                    }

                    console.log("new company obj: ", obj);

                    btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

                    //add the company
                    $.ajax({
                        method: "POST",
                        url: `/company`,
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
                    url: `/company/${company_id}?_csrf=${window._csrf}`,
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
            ajax: "/company",

            //tell datatables that our structure is in obj.companies
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `company-${row.id}`;
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
                { "data": "country_code" },
                { "data": "active" },
                { "data": "demo_acct" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            columnDefs: [
                {
                    targets: [ 2, 7, 11 ],
                    visible: false,
                    searchable: false
                },
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
                },
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
            $('#kt_object_add-edit_modal form input[name=address]').val('');
            $('#kt_object_add-edit_modal form input[name=city]').val('');
            $('#kt_object_add-edit_modal form input[name=state]').val('');
            $('#kt_object_add-edit_modal form input[name=zip]').val('');
            $('#kt_object_add-edit_modal form input[name=country_code]').val('');
            $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
            $('#kt_object_add-edit_modal form input[name=demo_acct]').prop('checked', false);
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