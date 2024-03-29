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
            $('.view-location').off();
            $('.edit-location').off();
            $('.add-location').off();
            $('.remove-location').off();
            $('.submit-edit-add-form').off();
            $('.cancel-edit-add-form').off();

            //bind everything needed
            $('.view-location').on('click', function(e) {
                e.preventDefault();

                //get object
                let row_id = $(e.currentTarget).data('location-id');
                let obj = getRowData(row_id);

                $('#kt_view_modal .object-field-company_id').html(obj.company_id);
                $('#kt_view_modal .object-field-name').html(obj.name);
                $('#kt_view_modal .object-field-description').html(obj.description);
                $('#kt_view_modal .object-field-address').html(obj.address);
                $('#kt_view_modal .object-field-city').html(obj.city);
                $('#kt_view_modal .object-field-state').html(obj.state);
                $('#kt_view_modal .object-field-zip').html(obj.zip);
                $('#kt_view_modal .object-field-country_code').html(obj.country_code);
                $('#kt_view_modal .object-field-coords').html(`\[ ${obj.latitude} / ${obj.longitude} \]`);
                $('#kt_view_modal .object-field-polygon').html(obj.polygon);
                $('#kt_view_modal .object-field-active').html(obj.active);
                $('#kt_view_modal .object-field-created_at').html( formatDate(obj.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(obj.updated_at) );

                //load obj information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${obj.name} (Location ID: ${obj.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-location').on('click', function(e) {
                e.preventDefault();

                //get location object
                let row_id = $(e.currentTarget).data('location-id');
                let obj = getRowData(row_id);

                console.log("EDIT location: ", obj);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${obj.name} (Location ID: ${obj.id})`);

                //fill form with content from location row
                $('#kt_object_add-edit_modal form input[name=company_id]').val(obj.company_id);
                $('#kt_object_add-edit_modal form input[name=name]').val(obj.name);
                $('#kt_object_add-edit_modal form input[name=description]').val(obj.description);
                $('#kt_object_add-edit_modal form input[name=address]').val(obj.address);
                $('#kt_object_add-edit_modal form input[name=city]').val(obj.city);
                $('#kt_object_add-edit_modal form input[name=state]').val(obj.state);
                $('#kt_object_add-edit_modal form input[name=zip]').val(obj.zip);
                $('#kt_object_add-edit_modal form input[name=country_code]').val(obj.country_code);

                $('#kt_object_add-edit_modal form input[name=latitude]').val(obj.latitude);
                $('#kt_object_add-edit_modal form input[name=longitude]').val(obj.longitude);
                $('#kt_object_add-edit_modal form input[name=polygon]').val(obj.polygon);
                $('#kt_object_add-edit_modal form input[name=altitude]').val(obj.altitude);

                if( checkToggle(obj.active) ){
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', true);
                } else {
                    $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
                }

                console.log("Current lat/lng: ", obj.latitude, obj.longitude);

                if( !obj.latitude || !obj.longitude ){
                    $('.latlong-coords-error').show();
                    $('.latlong-coords').hide();
                } else {
                    $('.latlong-coords-error').hide();
                    $('.latlong-coords').show();
                }

                $('.latlong-coords .latitude-value').html(obj.latitude);
                $('.latlong-coords .longitude-value').html(obj.longitude);


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

                    if( checkToggle(obj.active) ){
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    console.log("UPDATE LOCATION: ", obj);

                    //add the location
                    $.ajax({
                        method: "PUT",
                        url: `/location/${row_id}`,
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

                //init the maps handler
                KTGoogleMaps.init();

                //show the modal
                $('#kt_object_add-edit_modal').modal('show');
            });

            $('.add-location').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New Location`);
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

                    var obj = getFormData();

                    if( checkToggle(obj.active) ) {
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    console.log("ADD LOCATION: ", obj);

                    //add the location
                    $.ajax({
                        method: "POST",
                        url: `/location`,
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

            $('.remove-location').on('click', function(e) {
                e.preventDefault();

                let location_id = $(e.currentTarget).data('location-id');
                let row_id = `location-${location_id}`;

                console.log( `remove Location ID?: ${location_id}` );

                //delete the location
                $.ajax({
                    method: "DELETE",
                    url: `/location/${location_id}?_csrf=${window._csrf}`,
                    success: function(res) {
                        console.log("location deleted!: ", res);

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
            ajax: "/location",

            //tell datatables that our structure is in obj
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `location-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "company_id" },
                { "data": "name" },
                { "data": "description" },
                { "data": "address" },
                { "data": "city" },
                { "data": "state" },
                { "data": "zip" },
                { "data": "country_code" },
                { "data": "latitude" },
                { "data": "longitude" },
                { "data": "altitude" },
                { "data": "polygon" },
                { "data": "active" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            columnDefs: [
                {
                    "targets": [ 3,9,10,11,12,14,15 ],
                    "visible": false,
                    "searchable": false
                },
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
                                <a class="dropdown-item edit-location" href="#" data-location-id=${obj.id}><i class="la la-edit"></i> Edit Location</a>
                                <a class="dropdown-item remove-location" href="#" data-location-id=${obj.id}><i class="la la-remove"></i> Delete Location</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-location" title="View All Details" data-location-id=${obj.id}>
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
            let row_id = `location-${id}`;
            return table.row(`#${row_id}`).data();
        };

        let getFormData = function() {
            let objFormData = $('.location-add-edit-form').serializeArray();

            //loop through and prepare as an object
            let obj = {};
            objFormData.forEach(function(item) {
                obj[item.name] = item.value;
            });
            return obj;
        };

        let resetForm = function() {
            $('#kt_object_add-edit_modal .view-object-header').html('');
            $('#kt_object_add-edit_modal form input[name=company_id]').val('');
            $('#kt_object_add-edit_modal form input[name=name]').val('');
            $('#kt_object_add-edit_modal form input[name=description]').val('');
            $('#kt_object_add-edit_modal form input[name=address]').val('');
            $('#kt_object_add-edit_modal form input[name=city]').val('');
            $('#kt_object_add-edit_modal form input[name=state]').val('');
            $('#kt_object_add-edit_modal form input[name=zip]').val('');
            $('#kt_object_add-edit_modal form input[name=country_code]').val('');
            $('#kt_object_add-edit_modal form input[name=latitude]').val('');
            $('#kt_object_add-edit_modal form input[name=longitude]').val('');
            $('#kt_object_add-edit_modal form input[name=altitude]').val('');
            $('#kt_object_add-edit_modal form input[name=polygon]').val('');
            $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);

            //reset the coords shown
            $('.latlong-coords .latitude-value').html(0);
            $('.latlong-coords .longitude-value').html(0);

            //hide errors or values shown
            $('.latlong-coords-error').hide();
            $('.latlong-coords').hide();

            //hide the map
            $("#location-geocode-map").hide();
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