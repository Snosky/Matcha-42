// Convert Lat/Long to adress
let geocoder = new google.maps.Geocoder();
let latlng = new google.maps.LatLng(user.profile.geoLatitude, user.profile.geoLongitude);
geocoder.geocode({'latLng': latlng}, function(result, status){
    if (status === google.maps.GeocoderStatus.OK) {
        if (result[1]) {
            $('#autocompleteLocation').val(result[0].formatted_address);
        }
    } else {
        console.log(status);
    }
});

let autocompleteLocationInput = document.getElementById('autocompleteLocation');
let autocompleteLocation = new google.maps.places.Autocomplete(autocompleteLocationInput);

google.maps.event.addListener(autocompleteLocation, 'place_changed', function(){
    let place = autocompleteLocation.getPlace();
    if (place && place.geometry) {
        $('input[name=geoLatitude]').val(place.geometry.location.lat());
        $('input[name=geoLongitude]').val(place.geometry.location.lng());
    }
});
