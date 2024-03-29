"use strict";
let KTDatatablesExtensionsKeytable = function() {

    let modal = $('#kt_view_modal');

    let checkToggle = function(val){
        return val === "on" || val === 1 || val === true;
    };

    let initCampaignTable = function() {

        let initTableHandlers = function() {
            // clear click handlers
            $('.view-campaign').off();
            $('.edit-campaign').off();
            $('.add-campaign').off();
            $('.remove-campaign').off();
            $('.submit-edit-add-form').off();
            $('.cancel-edit-add-form').off();

            //bind everything needed
            $('.view-campaign').on('click', function(e) {
                e.preventDefault();

                //get campaign object
                let campaign_id = $(e.currentTarget).data('campaign-id');
                let campaign = getRowData(campaign_id);

                $('#kt_view_modal .object-field-company_id').html(campaign.company_id);
                $('#kt_view_modal .object-field-name').html(campaign.name);
                $('#kt_view_modal .object-field-category').html(campaign.category);
                $('#kt_view_modal .object-field-description').html(campaign.description);
                $('#kt_view_modal .object-field-game_id').html(campaign.game_id);
                $('#kt_view_modal .object-field-data').html(campaign.data);
                $('#kt_view_modal .object-field-date_start').html( formatDate(campaign.date_start) );
                $('#kt_view_modal .object-field-date_end').html( formatDate(campaign.date_end) );
                $('#kt_view_modal .object-field-created_at').html( formatDate(campaign.created_at) );
                $('#kt_view_modal .object-field-updated_at').html( formatDate(campaign.updated_at) );

                //load campaign information into modal and show it
                $('#kt_view_modal .view-object-header').html( `${campaign.name} (Campaign ID: ${campaign.id})`);
                $('#kt_view_modal').modal('show');
            });

            $('.edit-campaign').on('click', function(e) {
                e.preventDefault();

                //get campaign object
                let campaign_id = $(e.currentTarget).data('campaign-id');
                let campaign = getRowData(campaign_id);

                //fill modal with content
                $('#kt_object_add-edit_modal .view-object-header').html( `${campaign.name} (Campaign ID: ${campaign.id})`);

                //fill form with content from campaign row
                $('#kt_object_add-edit_modal form input[name=company_id]').val(campaign.company_id);

                if(campaign.company_id && campaign.company_id > 0){
                    $.ajax({
                        method: "GET",
                        url: `/admin/companies/${campaign.company_id}`
                    }).then( function(data){
                        if( data.id !== undefined ) {
                            $(".view_selected_company").html(`${data.name} (id: ${data.id})`)
                        }
                    });
                }

                $('#kt_object_add-edit_modal form input[name=name]').val(campaign.name);
                $('#kt_object_add-edit_modal form input[name=category]').val(campaign.category);
                $('#kt_object_add-edit_modal form input[name=description]').val(campaign.description);
                $('#kt_object_add-edit_modal form input[name=game_id]').val(campaign.game_id);

                if(campaign.game_id && campaign.game_id > 0){
                    $.ajax({
                        method: "GET",
                        url: `/admin/games/${campaign.game_id}`
                    }).then( function(data){
                        if( data.id !== undefined ) {
                            $(".view_selected_game").html(`${data.name} (id: ${data.id})`)
                        }
                    });
                }

                $('#kt_object_add-edit_modal form input[name=data]').val(campaign.data);
                $('#kt_object_add-edit_modal form input[name=date_start]').val( formatDate(campaign.date_start) );
                $('#kt_object_add-edit_modal form input[name=date_end]').val( formatDate(campaign.date_end) );

                if( checkToggle(campaign.active) ){
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

                    var btn = $(this);
                    var form = $(this).closest('form');

                    form.validate({
                        rules: {
                            company_id: {
                                required: () => {
                                    return ($(".view_selected_company").html() === "")
                                },
                                maxlength: 32,
                                digits: true
                            },
                            game_id: {
                                required: () => {
                                    return ($(".view_selected_game").html() === "")
                                },
                                digits: true
                            },
                            name: {
                                required: true,
                                maxlength: 80
                            },
                            category: {
                                required: true,
                                maxlength: 80
                            },
                            description: {
                                required: false,
                                maxlength: 1000
                            },
                            date_start: {
                                required: true,
                                date: true
                            },
                            date_end: {
                                required: true,
                                date: true
                            }
                        }
                    });

                    if (!form.valid()) {
                        return;
                    }

                    let obj = getFormData();

                    if( obj.company_id === "" ) {
                        delete obj.company_id
                    }
                    if( obj.game_id === "" ) {
                        delete obj.game_id
                    }

                    if( checkToggle(obj.active) ){
                        obj.active = 1;
                    } else {
                        obj.active = 0;
                    }

                    //add the campaign
                    $.ajax({
                        method: "PUT",
                        url: `/admin/campaigns/${campaign_id}`,
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

            $('.add-campaign').on('click', function(e) {
                e.preventDefault();

                //make sure the form is empty
                resetForm();

                $('#kt_object_add-edit_modal .view-object-header').html( `Add New Campaign`);
                $('#kt_object_add-edit_modal').modal('show');

                //unbind any handlers
                $('.submit-edit-add-form').off();
                $('.cancel-edit-add-form').off();

                $(".view_selected_company").html("N/A")
                $(".view_selected_game").html("N/A")

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
                            category: {
                                required: true,
                                maxlength: 80
                            },
                            description: {
                                required: false,
                                maxlength: 1000
                            },
                            game_id: {
                                required: true,
                                digits: true
                            },
                            date_start: {
                                required: true,
                                date: true
                            },
                            date_end: {
                                required: true,
                                date: true
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

                    console.log("new campaign obj: ", obj);

                    //add the campaign
                    $.ajax({
                        method: "POST",
                        url: `/admin/campaigns`,
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

            $('.remove-campaign').on('click', function(e) {
                e.preventDefault();

                let campaign_id = $(e.currentTarget).data('campaign-id');
                let row_id = `campaign-${campaign_id}`;

                //delete the campaign
                $.ajax({
                    method: "DELETE",
                    url: `/admin/campaigns/${campaign_id}?_csrf=${window._csrf}`,
                    success: function(res) {
                        console.log("campaign deleted!: ", res);

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

        let table = $('#campaigns').DataTable({
            processing: true,
            responsive: true,
            select: true,
            deferRender: true,
            pagingType: 'full_numbers',
            order: [[ 7, "desc" ]],

            //request uri
            ajax: "/admin/campaigns",

            //tell datatables that our structure is in obj.campaigns
            dataSrc: '',

            //give the row an id, for filling modals later
            rowId: function(row) {
                  return `campaign-${row.id}`;
            },

            //define the columns
            columns: [
                { "data": "id" },
                { "data": "company_id" },
                { "data": "name" },
                { "data": "category" },
                { "data": "description" },
                { "data": "game_id" },
                { "data": "data" },
                { "data": "date_start" },
                { "data": "date_end" },
                { "data": "active" },
                { "data": "created_at" },
                { "data": "updated_at" },
                { "data": "actions" }
            ],

            columnDefs: [
                {
                    "targets": [ 6 ],
                    "visible": false,
                    "searchable": false
                },
                {
                    targets: 7,
                    render: function(data, type, campaign, meta) {
                        return `${formatDate(campaign.date_start)}`;
                    }
                },
                {
                    targets: 8,
                    render: function(data, type, campaign, meta) {
                        return `${formatDate(campaign.date_end)}`;
                    }
                },
                //render time stamp
                {
                    targets: 10,
                    render: function(data, type, campaign, meta) {
                        return `${formatDate(campaign.created_at)}`;
                    }
                },
                //render time stamp
                {
                    targets: 11,
                    render: function(data, type, campaign, meta) {
                        return `${formatDate(campaign.updated_at)}`;
                    }
                },
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    searchable: false,
                    render: function(data, type, campaign, meta) {
                        return `
                        <span class="dropdown">
                            <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                              <i class="la la-ellipsis-h"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item edit-campaign" href="#" data-campaign-id=${campaign.id}><i class="la la-edit"></i> Edit Campaign</a>
                                <a class="dropdown-item remove-campaign" href="#" data-campaign-id=${campaign.id}><i class="la la-remove"></i> Delete Campaign</a>
                            </div>
                        </span>
                        <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md view-campaign" title="View All Details" data-campaign-id=${campaign.id}>
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
            let row_id = `campaign-${id}`;
            return table.row(`#${row_id}`).data();
        };

        let getFormData = function() {
            let formDataObj = $('.campaign-add-edit-form').serializeArray();

            //loop through and prepare as a campaign object
            let obj = {};
            formDataObj.forEach(function(item) {
                obj[item.name] = item.value;
            });
            return obj;
        };

        let resetForm = function() {
            $('#kt_object_add-edit_modal .view-object-header').html('');
            $('#kt_object_add-edit_modal form input[name=company_id]').val('');
            $('#kt_object_add-edit_modal form input[name=name]').val('');
            $('#kt_object_add-edit_modal form input[name=category]').val('');
            $('#kt_object_add-edit_modal form input[name=description]').val('');
            $('#kt_object_add-edit_modal form input[name=game_id]').val('');
            $('#kt_object_add-edit_modal form input[name=data]').val('');
            $('#kt_object_add-edit_modal form input[name=date_start]').val('');
            $('#kt_object_add-edit_modal form input[name=date_end]').val('');
            $('#kt_object_add-edit_modal form input[name=active]').prop('checked', false);
        };

        table.on( 'init', function(e, settings, json ) {
            initTableHandlers();
        });
    };

    $("#company_id").select2({
        placeholder: "Select a company...",
        allowClear: true,
        ajax: {
            url: "/admin/companies",
            dataType: 'json',
            delay: 350,
            data: function(params) {
                return {
                    q: params.term, // search term
                    page: params.page
                }
            },
            processResults: function(data, params) {
                console.log("processResults() :: data: ", data)

                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                params.page = params.page || 1;

                return {
                    results: data.aaData,
                    pagination: {
                        more: (params.page * 30) < data.aaData.length
                    }
                };
            },
            cache: true
        },
        minimumInputLength: 1,

        escapeMarkup: function(markup) {
            return markup;
        }, // let our custom formatter work
        templateResult: function (obj) {
            if (obj.loading) return obj.name;
            var markup = "<div>" +
                "<div>" +
                "<div>" + obj.name + "</div>"
            if (obj.description) {
                markup += "<div>" + obj.description + "</div>"
            }
            markup += "</div></div>"
            return markup;
        },
        templateSelection: function (obj) {
            if ( parseInt(obj.id) > 0 ) {
                return obj.name
            }
            return obj.text
        } // omitted for brevity, see the source of this page
    })
    $("#game_id").select2({
        placeholder: "Select a game...",
        allowClear: true,
        ajax: {
            url: "/admin/games",
            dataType: 'json',
            delay: 350,
            data: function(params) {
                return {
                    q: params.term, // search term
                    page: params.page
                }
            },
            processResults: function(data, params) {
                console.log("processResults() :: data: ", data.aaData)

                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                params.page = params.page || 1;

                return {
                    results: data.aaData,
                    pagination: {
                        more: (params.page * 30) < data.aaData.length
                    }
                };
            },
            cache: true
        },
        minimumInputLength: 1,

        escapeMarkup: function(markup) {
            return markup;
        }, // let our custom formatter work
        templateResult: function (obj) {
            if (obj.loading) return obj.name;
            var markup = "<div>" +
                "<div>" +
                "<div>" + obj.name + "</div>"
            if (obj.description) {
                markup += "<div>" + obj.description + "</div>"
            }
            markup += "</div></div>"
            return markup;
        },
        templateSelection: function (obj) {
            if ( parseInt(obj.id) > 0 ) {
                return obj.name
            }
            return obj.text
        } // omitted for brevity, see the source of this page
    })

    return {
        //main function to initiate the module
        init: function() {
            initCampaignTable();
        }
    };

}();

jQuery(document).ready(function() {
    KTDatatablesExtensionsKeytable.init();
    $('#date_start_picker').datetimepicker({
        pickerPosition: 'bottom-left',
        todayHighlight: true,
        autoclose: true,
        format: 'mm/dd/yyyy hh:ii'
    });

    $('#date_end_picker').datetimepicker({
        pickerPosition: 'bottom-left',
        todayHighlight: true,
        autoclose: true,
        format: 'mm/dd/yyyy hh:ii'
    });
});