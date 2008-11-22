// For what you are about to read, please forgive me.
// tom@tomtaylor.co.uk

$(document).ready(function() {
	// PLEASE GET YOUR OWN KEYS.
	var flickr_api_key = '9fd414a14e7cb7378546995888aea55f';
	var yahoo_geoplanet_api_key = 'dE28hNrV34GDiruGoUMw0JqPSRFyCpnYZpdZSDwdGzN_Nis5gaZevZRJkfswvaxsqQ7w';
	
	var gmap = new GMap2(document.getElementById("map"));
	gmap.addControl(new GSmallMapControl());
	var startingPoint = new GLatLng(51.506325,-0.127144);
	gmap.setCenter(startingPoint, 13);
	
	var bounds = new GLatLngBounds();
	
	var colours = ["red", "blue", "green", "purple", "orange", "yellow", "darkred", "darkblue", "darkgreen"];
	
	function displayPolygon(woeid) {
		$.getJSON('http://api.flickr.com/services/rest/?method=flickr.places.getInfo&api_key=' + flickr_api_key + '&woe_id=' + woeid + '&format=json&jsoncallback=?', function(data) {
			if(data.place.has_shapedata == 1) {
			
				$.each(data.place.shapedata.polylines.polyline, function(index,polyline) {
					thepoints = [];
					$.each(polyline._content.split(/ /), function(pindex, point) {
						lat = parseFloat(point.split(/,/)[0]);
						lng = parseFloat(point.split(/,/)[1]);
						thepoints[pindex] = new GLatLng(lat, lng);
					});
					
					var polyOptions = {geodesic:true};
					var colour = colours.shift();
					var name = data.place.name.split(',')[0];
					
					var polygon = new GPolygon(thepoints, colour, 5, 1, colour, 0.2, polyOptions);
					gmap.addOverlay(polygon);
					$('ul.legend-items').append('<li><div class="colour" style="background-color:' + colour + '"></div>' + name + '</li>');
					
					$.each(thepoints, function(pindex, point) {
						bounds.extend(point);
					});
				});
			
				if(!bounds.isEmpty()) {
					gmap.setCenter(bounds.getCenter(), gmap.getBoundsZoomLevel(bounds));
				}
			}
		});
	}
	
	function displayNeighbours(woeid) {
		$.getJSON('http://where.yahooapis.com/v1/place/' + woeid + '/neighbors?appid=' + yahoo_geoplanet_api_key + '&format=json&callback=?', function(data) {
			neighbours = [];
			$.each(data.places.place, function(index, place) {
				displayPolygon(place.woeid, place.name);
			});
		});
	}
	
	if (window.location.hash) {
		var hash = window.location.hash;
		var woeid = parseInt(hash.slice(1,hash.length));
		$('#neighbourhood-field').val('');
	} else {
		var woeid = 34709; // default to shoreditch, london
	}
		
	displayPolygon(woeid);
	displayNeighbours(woeid);
	
	$('#neighbourhood-search').submit(function(){
		// reset bounds
		bounds = new GLatLngBounds(); 
		colours = ["red", "blue", "green", "purple", "orange", "yellow", "darkred", "darkblue", "darkgreen"];
		var text = $('#neighbourhood-field').val();
		
		$.getJSON('http://where.yahooapis.com/v1/places.q(' + text + ')?appid=dE28hNrV34GDiruGoUMw0JqPSRFyCpnYZpdZSDwdGzN_Nis5gaZevZRJkfswvaxsqQ7w&format=json&callback=?', function(data) {
			if (data.places.place[0]) {
				var new_woeid = data.places.place[0].woeid;
				window.location.hash = new_woeid;
				gmap.clearOverlays();
				$('ul.legend-items').empty();
				displayPolygon(new_woeid);
				displayNeighbours(new_woeid);
			} else {
				alert("Couldn't find that place");
			}
		});
		return false;
	});
	
	// $.each(neighbours, function(i, n) {
	// 	alert(n);
	// 	// displayPolygon(this[0]);
	// });
	
	// displayPolygon(38629, "green", "lightgreen") // upper clapton
	// 	displayPolygon(43295, "red", "pink"); // lower clapton
	// 	displayPolygon(20089379, "blue", "lightblue"); // homerton
	// 	displayPolygon(20094311, "orange", "yellow") // clapton
	// 	displayPolygon(20089378, "purple", "pink")
	
});