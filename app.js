      
function initMap() {
        //display default map
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {lat: 37.3382, lng: -121.8863}
        });
        var geocoder = new google.maps.Geocoder();

        $('#submit').click(function() {
          geocodeAddress(geocoder, map);
        });
}


        //generate lat & lng from user's address input
function geocodeAddress(geocoder, resultsMap) {
        var address = $('#address').val();
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location
            });

            //calculate address
            var lat=((results[0].geometry.viewport.f.b)+(results[0].geometry.viewport.f.f))/2;
            var lng=((results[0].geometry.viewport.b.b)+(results[0].geometry.viewport.b.f))/2;
           
            console.log(lat, lng);
          
            //run Groupon API
            getData(lat, lng);
            function getData(a, b){
              $.ajax({
                url: 'https://partner-api.groupon.com/deals.json',
                data: {     
                  tsToken:'US_AFF_0_206568_212556_0',
                  lat: a,
                  lng: b,
                  filters:'category:food-and-drink',
                  radius:10,
                  offset:0,
                  limit: 10
                },
                dataType: 'jsonp',
                crossDomain: true,
                type: 'GET',



                //display results
                success: function(data){
                    $('.resultBox').html('');
                    var result=data.deals;
                    console.log(result.length);
                    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    var labelIndex = 0;

                    
                      $.each(result, function(index, value){
                      console.log(value);
                      var name=value.merchant.name;
                      var category=value.tags[0].name;
                      var street=value.options[0].redemptionLocations[0].streetAddress1;
                      var city=value.options[0].redemptionLocations[0].city;
                      var phone=value.options[0].redemptionLocations[0].phoneNumber;
                      var webUrl=value.merchant.websiteUrl;
                      var finePrint=value.finePrint; 
                      var mapPinInfo='<p class="name">'+name+'</p><p>'+street+'</p><p>'+
                      city+'</p><p>'+phone+'</p>';

                      ;
                      //pin on map
                      var coords = value.options[0].redemptionLocations[0];
                      var latLng = new google.maps.LatLng(coords.lat,coords.lng);
                      
                      var marker = new google.maps.Marker({
                        position: latLng,
                        label: labels[labelIndex++ % labels.length],
                        map: resultsMap
          
                      }); 
                      var markerLabel=marker.label;
                      console.log(markerLabel);

                      //show restaurant name on map
                      var infowindow = new google.maps.InfoWindow({
                        content: mapPinInfo
                      });

                      marker.addListener('click', function(){
                        infowindow.open(map, marker);
                      });
                   

                      //add result 
                      var purchasehtml='';

                      for (var i=0; i<value.options.length; i++){
                        purchasehtml+='<p><a href="'+value.options[i].buyUrl+'" target="_blank">';
                        purchasehtml+=value.options[i].title+'</a></p>';      
                      }
                
                      $('.resultBox').append('<div class="result-item"><h1>'+name+'</h1>'+
                        '<img src="pin.svg" class="pinImage"><p class="markerLabel">'
                        +markerLabel+'</p><p>'+category+'</p>'+
                        '<img src="foodone.jpg" alt="yelp images and rating">'+
                        '<img src="foodtwo.jpg" alt="yelp images and rating">'+
                        '<img src="foodthree.jpg" alt="yelp images and rating">'+
                        '<p>'+"Purchase Options:"+'</p>'+
                        '<p>'+purchasehtml+'</p>'+
                        '<p>'+"Make a Reservation"+'</p>'+
                        '<p class="fineprintContent">'+"finePrint"+'</p>'+
                        '<div class="finePrint">'+finePrint+' (click to hide)'+'</div></div>');
                    });
                 
                    $('.fineprintContent').click(function(){
                      $(this).siblings('.finePrint').show();
                    });
                    $('.finePrint').click(function(){
                      $('.finePrint').hide();
                    });
  

                }
              });
            }
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });

}




