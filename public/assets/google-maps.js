"use strict";

// Class definition
var KTGoogleMaps = function() {

    // Private functions


    //set the lat/lng as the lat/long that was entered
    var coords = {
        lat: 0,
        lng: 0
    };
    var enablePolygonDrawing = function() {
        var map = new GMaps({
            div: '#location-polygon-map',
            lat: coords.lat,
            lng: coords.lng
        });

        var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.CIRCLE,
        drawingControl: true,
        drawingControlOptions: {
            drawingModes: [
                google.maps.drawing.OverlayType.CIRCLE
            ]
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
        }
        });
        drawingManager.setMap(map);



        //add a button to clear the polygon and reset

        //only get the path after user completes a shape
        // var path = [
        //     [-12.040397656836609, -77.03373871559225],
        //     [-12.040248585302038, -77.03993927003302],
        //     [-12.050047116528843, -77.02448169303511],
        //     [-12.044804866577001, -77.02154422636042]
        // ];

        // var polygon = map.drawPolygon({
        //     paths: path,
        //     strokeColor: '#BBD8E9',
        //     strokeOpacity: 1,
        //     strokeWeight: 3,
        //     fillColor: '#BBD8E9',
        //     fillOpacity: 0.6
        // });
    }

    var enableGeocoding = function() {
        var handleGeocode = function() {
            //gather all information for a proper geocode request
            let address = $('#kt_object_add-edit_modal form input[name=address]').val();
            let city = $('#kt_object_add-edit_modal form input[name=city]').val();
            let state = $('#kt_object_add-edit_modal form input[name=state]').val();
            let zip = $('#kt_object_add-edit_modal form input[name=zip]').val();
            let country_code = $('#kt_object_add-edit_modal form input[name=country_code]').val();

            if( address !== '' && city !== '' && state !== '' ) {
                let complete_address = `${address},${city},${state}`;
                if( zip != '' ){
                    complete_address += ` ${zip}`
                }
                if( country_code != '' ){
                    complete_address += ` ${country_code}`
                }

                $('.latlong-coords-error').addClass('kt-hidden');
                $('.latlong-coords').addClass('kt-hidden');

                GMaps.geocode({
                    address: complete_address,
                    callback: function(results, status) {
                        if (status == 'OK') {
                            var latlng = results[0].geometry.location;

                            coords.lat = latlng.lat();
                            coords.lng = latlng.lng();

                            console.log("GEOCODE SUCCESS: ", coords)

                            //don't bother with the map, just drop the coords into the lat/lng
                            // $('.latlong-coords').html(`(${latlng.lat()},${latlng.lng()})`)
                            $('.latlong-coords .latitude-value').html(coords.lat);
                            $('.latlong-coords .longitude-value').html(coords.lng);

                            $('.latlong-coords-error').addClass('kt-hidden');
                            $('.latlong-coords').removeClass('kt-hidden');

                            //geocoding options
                            $('#location-geocode-map').slideDown();
                            var map = new GMaps({
                                div: '#location-geocode-map',
                                lat: coords.lat,
                                lng: coords.lng
                            });
                            map.addMarker(coords);

                            //polygon options
                            $('.polygon-group').slideDown();
                            enablePolygonDrawing();
                        }
                    }
                });
            } else {
                // $('.polygon-group').slideUp();
                $('.latlong-coords').addClass('kt-hidden');
                $('.latlong-coords-error').removeClass('kt-hidden');
            }
        }

        $('#geocode-address').off('click');

        $('#geocode-address').click(function(e) {
            e.preventDefault();
            handleGeocode();
        });
    }

    return {
        // public functions
        init: function() {
            enableGeocoding();
        }
    };
}();

jQuery(document).ready(function() {
    KTGoogleMaps.init();
});