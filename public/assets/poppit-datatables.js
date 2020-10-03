"use strict";
var KTDatatablesExtensionsKeytable = function() {

    // $('#kt_company_modal').modal('show');
    var modal = $('#kt_company_modal');

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

        table.on( 'init', function ( e, settings, json ) {
            // console.log("rowData: ", rowData );

            $('.view-company').on('click', function(e){
                e.preventDefault();
                console.log("SHOW MODAL FOR COMPANY :: event: ", e)

                // let company_id = $(event.currentTarget).parent('tr').data('row-id');

                let company_id = $(event.currentTarget).data('company-id');
                let company_row_id = `company-${company_id}`;
                let tableRow = table.row(company_row_id);
                let row_data = table.row(company_row_id).data();

                console.log( `edit company_id?: ${company_id}` );
                console.log( `edit company_row_id?: ${company_row_id}` );

                console.log( "tableRow? : ", tableRow.id() );
                console.log( "row data? : ", row_data );

                //{$(event.currentTarget).data('company-id')}
                // $('#kt_company_modal .company-header').html( `${} (Company ID: ${})`);

                $('#kt_company_modal').modal('show');
            });
            $('.remove-company').on('click', function(e){
                e.preventDefault();

                console.log("[REMOVE] COMPANY :: event: ", e)

                let company_id = $(event.currentTarget).data('company-id');

                console.log( `remove company id?: ${company_id}` );

                //delete the company
                // $.ajax({
                //     method: "DELETE",
                //     url: `/company/${company_id}`,
                //     success: function(res) {
                //         console.log("company deleted!: ", res);
                //     },
                //     error: function(e) {
                //         console.error(e);
                //     }
                // });

                //remove the row from the table

            });
            $('.edit-company').on('click', function(e){
                e.preventDefault();

                console.log("SHOW [EDIT] MODAL FOR COMPANY :: event: ", e)
                console.log( `edit company id?: ${$(event.currentTarget).data('company-id')}` );

                $('#kt_company_add-edit_modal').modal('show');
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