var mapperViewModel;

function Mapper (data, parent) {
  var self = this;
  self.mapperName = data.name;
  self.contribution_ids = data.contribution_ids;
  self.numContributions = data.count || 0;
  self.lastUpdated = new Date();
  self.contributions = ko.observableArray();
  self.select = function () {
    location.hash = '/' + self.mapperName;
    self.contributions([]);
    $.getJSON('http://jazzycat-emit-meow-api.nko3.jit.su/contribution/' +
      self.mapperName,
      function (data, status) {
      if(status === 'success') {
        console.log('Contributions found: ', data.length);
        data.forEach(function (contrib) {
          self.contributions.push(new Contribution(contrib, self));
        });
        console.log('Viewing ' + self.contributions().length + ' contributions');

        // Load in map
        loadMapperMap();
      }
    });
    parent.selectedMapper(self);
  };
  self.deselect = function () {
  };
}

function MapperViewModel () {
  var self = this;
  $.getJSON('http://jazzycat-emit-meow-api.nko3.jit.su/keyword',
    function (data, status) {
    if(status === 'success') {
      console.log('Mappers found: ', data.length);
      data.forEach(function (mapper) {
        self.mappers.push(new Mapper(mapper, self));
      });
    }
  });
  // // DEV FOR ITEMS
  // setTimeout(function () {
    // var data = [{'name': 'you', 'count': 20}, {'name': 'are', 'count': 10}, {'name': 'on', 'count': 3}, {'name': 'dev', 'count': 19}];
    // console.log(data.length);
    // data.forEach(function (mapper) {
      // self.mappers.push(new Mapper(mapper, self));
    // });
  // }, 100);

  self.mappers = ko.observableArray();
  self.filteredMappers = ko.computed(function () {
    var filtered = [];
    self.mappers().forEach(function (element) {
      if (!self.search()) {
        return filtered.push(element);
      }
      var test = new RegExp(self.search());
      if (test.test(element.mapperName)) {
        filtered.push(element);
      }
    });
    return filtered;
  });

  self.selectedMapper = ko.observable();
  self.createMapper = function () {
    // TODO: Gather data for creation of new mapper
    self.mappers.push(new Mapper({}, self));
  };
  self.user = ko.observable();
  self.selectedAPI = ko.observable();

  self.gotoMappers = function () {
    location.hash = '/';
    self.selectedMapper(null);
    self.selectedAPI(null);
  };

  self.gotoAPI = function () {
  console.log('aaaa');
    location.hash = 'api';
    self.selectedMapper(null);
    self.selectedAPI(new API({}, self));
  };

  self.search = ko.observable();
}

window.mapperViewModel = new MapperViewModel();

$(function() {
  ko.applyBindings(mapperViewModel);

  var $nav = $('ul.nav');

  $nav.on('click', 'li', function () {
    var context = $(this).context,
      $clicked = $(context);
    $clicked.siblings().removeClass('active');
    $clicked.addClass('active');
  });
});


function loadMapperMap() {
  var mapper = mapperViewModel.selectedMapper(),
      contributions = mapper.contributions(),
      locations = contributions;

  // Generate our map
  var map = new GMaps({
    div: '#map'
  });

  // // DEV: Break all pass-by-objects to avoid GMaps deletion of cities
  // locations = JSON.parse(JSON.stringify(locations));

  // Render locations to markers
  var markers = locations.map(function (location) {
    var marker = map.createMarker(location);
    return marker;
  });

  // Add the markers to the map manually (a small hack for MarkerClusterer)
  map.markers.push.apply(map.markers, markers);

  // Create a marker clusterer on the locations
  var mcOptions = {gridSize: 50, maxZoom: 15},
      mc = new MarkerClusterer(map.map, markers, mcOptions);

  // Fit the zoom to the markers on the map
  map.fitZoom();
}
/*global mapperViewModel*/

/**
 * @param {Object} data
 * @param {String|Number} data.lat Latitude of location
 * @param {String|Number} data.lng Longitude of location
 */
function Location(data) {
  // Save the data to our object
  var self = this;
  if (data.lat) { self.lat = +data.lat; }
  if (data.lng) { self.lng = +data.lng; }
}
/*global mapperViewModel*/

/**
 * @param {Object} data
 * @param {String|Number} data.lat Latitude of location
 * @param {String|Number} data.lng Longitude of location
 */
function Geospecify(data) {
  // Save the data to our object
  var self = this;
  this.submit = function () {
    console.log('zzxz', arguments);
  };
}
function API(data, parent) {
  var self = this;
  self.routes = ko.observableArray();
  $.getJSON('http://jazzycat-emit-meow-api.nko3.jit.su/',
    function (data, status) {
    if(status === 'success') {
      console.log('API methods found!');
      Object.getOwnPropertyNames(data).forEach(function (name) {
        var description = data[name],
            route = {'name': name};
        Object.merge(route, description);
        Object.merge(route, {'post_body_template': null});
        self.routes.push(route);
      });
    }
  });
}
function Contribution (data, parent) {
  var self = this;
  self.lat = data.lat;
  self.lng = data.lng;
  self.keywords = ko.observableArray(data.keywords);
  self.meta = ko.observable(data.meta || {});
}
/*global mapperViewModel*/
function User (data) {
  var self = this;
  Object.merge(self, data);
}

(function () {
  if (document.location.hash.length !== 0) {
    var token_query = encodeURIComponent(document.location.hash.substring(1));
    // var url = "https://www.dailycred.com/graph/me.json?" +
      // "client=a17d7abb-849a-4fd1-ad9c-eff1eaf0cfb0";
    var url = "https://www.dailycred.com/graph/me.json?" +
      "client=a17d7abb-849a-4fd1-ad9c-eff1eaf0cfb0&" + token_query;
    $.ajax({
      url: url,
      dataType: 'json',
      success: function (data) {
        window.mapperViewModel.user(new User(data));
      }
    });
  }
})();