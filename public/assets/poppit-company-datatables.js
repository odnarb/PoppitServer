"use strict";
let KTDatatablesExtensionsKeytable = function() {

    // $('#kt_view_modal').modal('show');
    let modal = $('#kt_view_modal');

    let initCompanyTable = function() {

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

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function(e) {
                    e.preventDefault();

                    let company = getFormData();

                    console.log("company obj: ", company);

                    //add the company
                    $.ajax({
                        method: "PUT",
                        url: `/company/${company_id}`,
                        data: $('.company-add-edit-form').serializeArray(),
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

                    let company = getFormData();

                    console.log("new company obj: ", company);

                    //add the company
                    $.ajax({
                        method: "POST",
                        url: `/company`,
                        data: company,
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

            $('.remove-company').on('click', function(e) {
                e.preventDefault();

                let company_id = $(e.currentTarget).data('company-id');
                let row_id = `company-${company_id}`;

                console.log( `remove company id?: ${company_id}` );

                //delete the company
                $.ajax({
                    method: "DELETE",
                    url: `/company/${company_id}`,
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
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            //TODO: after editing an object: the click handlers don't work

            columnDefs: [
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
            let companyFormData = $('.company-add-edit-form').serializeArray();

            //loop through and prepare as a company object
            let company = {};
            companyFormData.forEach(function(item) {
                company[item.name] = item.value;
            });
            return company;
        };

        let resetForm = function() {
            $('#kt_object_add-edit_modal .view-object-header').html( '' );
            $('#kt_object_add-edit_modal form input[name=name]').val('');
            $('#kt_object_add-edit_modal form input[name=description]').val('');
            $('#kt_object_add-edit_modal form input[name=address]').val('');
            $('#kt_object_add-edit_modal form input[name=city]').val('');
            $('#kt_object_add-edit_modal form input[name=state]').val('');
            $('#kt_object_add-edit_modal form input[name=zip]').val('');
        };

        table.on( 'init', function(e, settings, json ) {
            initTableHandlers();
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            initCompanyTable();
        }
    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
});