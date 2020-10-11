"use strict";

// Class definition
var KTGoogleMaps = function() {

    function drawCircle(point, radius, dir) {
      var d2r = Math.PI / 180;   // degrees to radians
      var r2d = 180 / Math.PI;   // radians to degrees
      var earthsradius = 3963; // 3963 is the radius of the earth in miles

      var points = 32;

      // find the raidus in lat/lon
      var rlat = (radius / earthsradius) * r2d;
      var rlng = rlat / Math.cos(point.lat() * d2r);

      var extp = new Array();
      if (dir==1) {
         var start=0;
         var end=points+1; // one extra here makes sure we connect the path
      } else {
         var start=points+1;
         var end=0;
      }
      for (var i=start; (dir==1 ? i < end : i > end); i=i+dir) {
         var theta = Math.PI * (i / (points/2));
         var ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
         var ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
         extp.push(new google.maps.LatLng(ex, ey));
      }
      return extp;
    }

    //set the lat/lng as the lat/long that was entered
    var coords = {
        lat: 0,
        lng: 0
    };

    var initMap = function() {
        var bindMapHandlers = function() {
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

                            var latlng = new google.maps.LatLng(coords.lat,coords.lng);
                            let paths = drawCircle(latlng, 0.035, 1);

                            //set paths to a hidden field on the UI
                            $('.polygon-paths').html(paths.toString())

                            var circle = map.drawPolygon({
                                zoom: 20,
                                paths: paths,
                                strokeColor: '#432070',
                                strokeOpacity: 0.6,
                                strokeWeight: 2,
                                fillColor: '#432070',
                                fillOpacity: 0.3
                            });
                        }
                    }
                });
            } else {
                $('.latlong-coords').addClass('kt-hidden');
                $('.latlong-coords-error').removeClass('kt-hidden');
            }
        }

        $('#geocode-address').off('click');

        $('#geocode-address').click(function(e) {
            e.preventDefault();
            bindMapHandlers();
        });
    }

    return {
        // public functions
        init: function() {
            initMap()
        }
    };
}();

jQuery(document).ready(function() {
    KTGoogleMaps.init();
});