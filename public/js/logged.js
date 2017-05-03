(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(test)
    } else {
        $.getJSON("http://freegeoip.net/json/", function(data) {
            test({
                coords: {
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            });
        });
    }

    function test(position) {
        socket.emit('geo.update', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        })
    }
})();