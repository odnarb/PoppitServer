"use strict";
let KTDatatablesExtensionsKeytable = function() {

    let modal = $('#kt_view_modal');

    let initTable = function() {

        let initTableHandlers = function() {
            // clear click handlers
            $('.view-invoice').off();

            //bind everything needed
            $('.view-invoice').on('click', function(e) {
                e.preventDefault();

                //get invoice object
                let obj_id = $(e.currentTarget).data('invoice-id');
                let obj = getRowData(obj_id);

                $('#kt_view_modal .object-field-id').html(obj.id);
                $('#kt_view_modal .object-field-company_id').html(obj.company_id);
                $('#kt_view_modal .object-field-category').html(obj.num_locations);
                $('#kt_view_modal .object-field-category').html(obj.num_campaigns);
                $('#kt_view_modal .object-field-notes').html(obj.notes);
                $('#kt_view_modal .object-field-date_start').html( formatDate(obj.date_start) );
                $('#kt_view_modal .object-field-date_end').html( formatDate(obj.date_end) );
                $('#kt_view_modal .object-field-created_at').html( formatDate(obj.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(obj.updated_at) );
                $('#kt_view_modal .object-field-amount').html(obj.amount);

                //load invoice information into modal and show it
                $('#kt_view_modal .view-object-header').html( `Invoice ID: ${obj.id} :: (Starting ${formatDate(invoice.date_start)})`);
                $('#kt_view_modal').modal('show');
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
            ajax: "/companyinvoice",

            //tell datatables that our structure is the obj
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `invoice-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "company_id" },
                { "data": "num_locations" },
                { "data": "num_campaigns" },
                { "data": "notes" },
                { "data": "date_start" },
                { "data": "date_end" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "amount" },
                { "data": "actions" }
            ],

            columnDefs: [
                //render time stamps
                // {
                //     targets: -6,
                //     render: function(data, type, obj, meta) {
                //         return `${formatDate(obj.date_start)}`;
                //     }
                // },
                // {
                //     targets: -5,
                //     render: function(data, type, obj, meta) {
                //         return `${formatDate(obj.date_end)}`;
                //     }
                // },
                // {
                //     targets: -4,
                //     render: function(data, type, obj, meta) {
                //         return `${formatDate(obj.created_at)}`;
                //     }
                // },
                // {
                //     targets: -3,
                //     render: function(data, type, obj, meta) {
                //         return `${formatDate(obj.updated_at)}`;
                //     }
                // },
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    searchable: false,
                    render: function(data, type, obj, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-invoice" title="View All Details" data-invoice-id=${obj.id}><i class="la la-eye"></i></a>
                                <a class="dropdown-item remove-invoice" href="#" data-invoice-id=${obj.id}><i class="la la-remove"></i> Delete Invoice</a>
                            </div>
                        </span>`;
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
            let row_id = `invoice-${id}`;
            return table.row(`#${row_id}`).data();
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