
$('.letsgoButton').click(function() {
    $('.left').css("background", "white")
    $('.topSearch').show();
    $('.frontPage').hide();
});


function initMap() {
    //display default map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: 37.3382, lng: -121.8863 }
    });
    var geocoder = new google.maps.Geocoder();

    $('.icon').click(function() {
        geocodeAddress(geocoder, map);

    });
    $(document).keypress(function(e) {
        if (e.which == 13) {
            geocodeAddress(geocoder, map);
        }
    });
}


//generate lat & lng from user's address input
function geocodeAddress(geocoder, resultsMap) {
    var address = $('#address').val();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });

            //calculate address
            var lat = ((results[0].geometry.viewport.f.b) + (results[0].geometry.viewport.f.f)) / 2;
            var lng = ((results[0].geometry.viewport.b.b) + (results[0].geometry.viewport.b.f)) / 2;
            console.log(lat, lng);

            //run Groupon API
            getData(lat, lng);

            function getData(a, b) {
                $.ajax({
                    url: 'https://partner-api.groupon.com/deals.json',
                    data: {
                        tsToken: 'US_AFF_0_206568_212556_0',
                        lat: a,
                        lng: b,
                        filters: 'category:food-and-drink',
                        radius: 10,
                        offset: 0,
                        limit: 20
                    },
                    dataType: 'jsonp',
                    crossDomain: true,
                    type: 'GET',


                    //display results
                    success: function(data) {

                        $('.resultSection').html('');
                        var result = data.deals;
                        console.log(result.length);
                        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        var labelIndex = 0;
                        var lastInfo;
                        $.each(result, function(index, value) {
                            console.log(value);
                            var name = value.merchant.name;
                            var category = value.tags[0].name;
                            var street = value.options[0].redemptionLocations[0].streetAddress1;
                            var city = value.options[0].redemptionLocations[0].city;
                            var state = value.options[0].redemptionLocations[0].state;
                            var phone = value.options[0].redemptionLocations[0].phoneNumber;
                            var webUrl = value.merchant.websiteUrl;
                            var finePrint = value.finePrint;
                            var grouponImg = value.grid4ImageUrl;

                            //restaurant info and google directions 
                            var mapPinInfo = '<p class="name">' + name + '</p><p>' + street + '</p><p>' +
                                city + '</p><p>' + phone + '</p><p><a href="https://www.google.com/maps/dir/Current+Location/' + street + '+' + city + '+' + state + '" target="_blank">Driving Directions</a></p>';

                            //pin on map
                            var coords = value.options[0].redemptionLocations[0];
                            var latLng = new google.maps.LatLng(coords.lat, coords.lng);

                            var marker = new google.maps.Marker({
                                position: latLng,
                                label: labels[labelIndex++ % labels.length],
                                map: resultsMap
                            });
                            var markerLabel = marker.label;
                            console.log(markerLabel);

                            //show restaurant name on map
                            var infowindow = new google.maps.InfoWindow({
                                content: mapPinInfo
                            });


                            marker.addListener('click', function() {
                                if (lastInfo) {
                                    lastInfo.close();
                                }
                                lastInfo = infowindow;
                                infowindow.open(map, marker);
                            });


                            //add result 
                            var purchasehtml = '';

                            for (var i = 0; i < value.options.length; i++) {
                                purchasehtml += '<p><a href="' + value.options[i].buyUrl + '" target="_blank">';
                                purchasehtml += value.options[i].title + '</a></p>';
                            }

                            //call yelp API
                            function yelpData(name, city, markerLabel, category, grouponImg, purchasehtml, finePrint, mapPinInfo) {
                                //correct url name for yelp 
                                var yelpName = name.split(' ').join('-').toLowerCase();
                                var yelpCity = city.split(' ').join('-').toLowerCase();
                                var url = 'https://quiet-springs-39660.herokuapp.com/api/business/' + yelpName + '-' + yelpCity + '';
                                $.getJSON(url, function(data) {

                                    if (data.statusCode == 400) {
                                        var rating = "http://i.imgur.com/TLAwcxg.jpg";
                                        var reviewCount = 0;
                                    } else {
                                        var rating = data.rating_img_url;
                                        var reviewCount = data.review_count;
                                    }

                                    $('.resultSection').append('<div class="resultText"><p class="nameText">' +
                                        markerLabel + '. ' + name + '</p>' +
                                        '<p class="categoryText">' + category + '</p><img src="' + grouponImg + '">' + '<p>' +
                                        '<img src="' + rating + '" alt="yelp rating">' + " " + reviewCount + ' Reviews' + '</p>' +
                                        '<img src="images/dealicon.png">' + "Purchase Options:" + '<ul><li>' +
                                        purchasehtml + '</li></ul>' +'<div class="fineprintContent">' +
                                        '<img src="images/printicon.png">' + " " + "finePrint" + '</div>' +
                                        '<div class="finePrint">' + finePrint + '(click to hide)' + '</div>' + '<br>' +
                                        '<div class="restaurantInfo">' + mapPinInfo  + '</div>' +
                                        '<hr>');

                                    $('.fineprintContent').click(function() {
                                        $(this).siblings('.finePrint').show();
                                    });
                                    $('.finePrint').click(function() {
                                        $('.finePrint').hide();
                                    });
                                });
                            };
                            yelpData(name, city, markerLabel, category, grouponImg, purchasehtml, finePrint, mapPinInfo);

                        });


                    }
                });
            }
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

}
