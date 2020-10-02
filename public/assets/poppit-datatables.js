"use strict";
var KTDatatablesExtensionsKeytable = function() {

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
                    render: function(data, type, full, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="#"><i class="la la-edit"></i> Edit Company</a>
                                <a class="dropdown-item" href="#"><i class="la la-remove"></i> Delete Company</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View All Details">
                          <i class="la la-eye"></i>
                        </a>`;
                    },
                }
            ]
        });

    };

    return {

        //main function to initiate the module
        init: function() {
            initCompanyTable();
        },

    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
});