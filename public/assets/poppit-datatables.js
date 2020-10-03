"use strict";
var KTDatatablesExtensionsKeytable = function() {

    // $('#kt_view_modal').modal('show');
    var modal = $('#kt_view_modal');

    var initCompanyTable = function() {
        // begin first table
        var table = $('#kt_table_1').DataTable({
            processing: true,
            responsive: true,
            select: true,
            deferRender: true,
            pagingType: 'full_numbers',
            order: [[ 7, "desc" ]],

            //reques uri
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

            columnDefs: [
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

        var getRowDataFromEvent = function(e){
            //drill in to get the row id from the event
            let company_id = $(event.currentTarget).data('company-id');
            let row_id = `company-${company_id}`;
            return table.row(`#${row_id}`).data();
        }

        table.on( 'init', function ( e, settings, json ) {
            // console.log("rowData: ", rowData );

            $('.view-company').on('click', function(e){
                e.preventDefault();
                console.log("SHOW MODAL FOR COMPANY :: event: ", e)

                let company = getRowDataFromEvent(e);
                $('#kt_view_modal .view-object-header').html( `${company.name} (Company ID: ${company.id})`);

                $('#kt_view_modal').modal('show');
            });

            $('.edit-company').on('click', function(e){
                e.preventDefault();

                console.log("SHOW [EDIT] MODAL FOR COMPANY :: event: ", e)
                console.log( `edit company id?: ${$(event.currentTarget).data('company-id')}` );

                let company = getRowDataFromEvent(e);
                $('#kt_object_add-edit_modal .view-object-header').html( `${company.name} (Company ID: ${company.id})`);
                $('#kt_object_add-edit_modal').modal('show');
            });

            $('.add-company').on('click', function(e){
                e.preventDefault();

                console.log("SHOW [ADD] MODAL");
                console.log( `add new company` );

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New Company`);
                $('#kt_object_add-edit_modal').modal('show');

                //bind the submit/cancel buttons
                $('.submit-edit-add-form').on('click', function (e) {
                    console.log("submit form and reset")

                    //add the company
                    // $.ajax({
                    //     method: "POST",
                    //     url: `/company`,
                    //     data: $('.kt-form').serializeArray();
                    //     success: function(res) {
                    //         console.log("company added!: ", res);
                    //         //reset form
                    //         //unbind buttons
                    //     },
                    //     error: function(e) {
                    //         console.error(e);
                    //     }
                    // });
                });

                $('.cancel-edit-add-form').on('click', function (e) {
                    console.log("close dialog and reset form")
                })
            });

            $('.remove-company').on('click', function(e){
                e.preventDefault();

                console.log("[REMOVE] COMPANY :: event: ", e)

                let company_id = $(event.currentTarget).data('company-id');
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