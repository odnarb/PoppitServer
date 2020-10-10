"use strict";

// Class definition
var KTGoogleMapsDemo = function() {

    // Private functions
    var enablePolygonDrawing = function() {
        var map = new GMaps({
            div: '#location-polygon-map',
            lat: -12.043333,
            lng: -77.028333
        });

        var path = [
            [-12.040397656836609, -77.03373871559225],
            [-12.040248585302038, -77.03993927003302],
            [-12.050047116528843, -77.02448169303511],
            [-12.044804866577001, -77.02154422636042]
        ];

        var polygon = map.drawPolygon({
            paths: path,
            strokeColor: '#BBD8E9',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#BBD8E9',
            fillOpacity: 0.6
        });
    }

    var enableGeocoding = function() {
        // var map = new GMaps({
        //     div: '#kt_gmap_8',
        //     lat: -12.043333,
        //     lng: -77.028333
        // });

        var handleAction = function() {
            var text = $.trim($('#kt_gmap_8_address').val());

            //gather all information for a proper geocode request
            //address
            //city
            //state
            //zip
            //country_code
            let address = $('#kt_object_add-edit_modal form input[name=address]').val();
            let city = $('#kt_object_add-edit_modal form input[name=city]').val();
            let state = $('#kt_object_add-edit_modal form input[name=state]').val();
            let zip = $('#kt_object_add-edit_modal form input[name=zip]').val();
            let country_code = $('#kt_object_add-edit_modal form input[name=country_code]').val();

            if( address !== '' && city !== '' && state !== '' ) {
                let complete_address = `${address},${city},${state} ${zip} ${country_code}`;

                console.log("GEOCODE THIS: ", complete_address);

                $('.latlong-coords-error').addClass('kt-hidden');
                $('.latlong-coords').addClass('kt-hidden');

                GMaps.geocode({
                    address: complete_address,
                    callback: function(results, status) {
                        if (status == 'OK') {
                            var latlng = results[0].geometry.location;

                            console.log("GEOCODE SUCCESS: ", latlng)

                            //don't bother with the map, just drop the coords into the lat/lng
                            // $('.latlong-coords').html(`(${latlng.lat()},${latlng.lng()})`)
                            $('.latlong-coords .latitude-value').html(latlng.lat());
                            $('.latlong-coords .longitude-value').html(latlng.lng());

                            $('.latlong-coords-error').addClass('kt-hidden');
                            $('.latlong-coords').removeClass('kt-hidden');

                            // $('#kt_object_add-edit_modal form input[name=latitude]').val(latlng.lat());
                            // $('#kt_object_add-edit_modal form input[name=longitude]').val(latlng.lng());

                            // map.setCenter(latlng.lat(), latlng.lng());
                            // map.addMarker({
                            //     lat: latlng.lat(),
                            //     lng: latlng.lng()
                            // });
                            // KTUtil.scrollTo('kt_gmap_8');
                        }
                    }
                });
            } else {
                $('.latlong-coords').addClass('kt-hidden');
                $('.latlong-coords-error').removeClass('kt-hidden');
            }
        }

        $('#geocode-address').click(function(e) {
            e.preventDefault();
            console.log("GEOCODE CAUGHT");
            handleAction();
        });
    }

    return {
        // public functions
        init: function() {
            // enablePolygonDrawing();
            enableGeocoding();
        }
    };
}();

jQuery(document).ready(function() {
    KTGoogleMapsDemo.init();
});