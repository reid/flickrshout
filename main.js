var IRFlickrShout = {
    start: function() {
        IRFlickrShout.error.clear();
        IRFlickrShout.sbox.start();
    },
    userId: {
        start: function() {
            //getappdata
        },
        submit: function() {
            console.log('got submit for user');
        }
    },
    sbox: {
        start: function() {
            //var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=corruptlogic&api_key=b25b959554ed76058ac220b7b2e0a026";
            var url = "http://apps.idearefuge.com/gadgets/as/evil.html";
            var url = "http://api.flickr.com/services/feeds/photos_public.gne?id=42995562@N00&lang=en-us";
            var params = {};
            //params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
            params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
            gadgets.io.makeRequest(url, IRFlickrShout.sbox.ready, params);
        },
        ready: function(obj) {
            console.log(obj);
            var items = obj.data.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                console.log(item.title);
            }
            document.getElementById('recent-photos').innerHTML = obj.text;
        }
    },
    error: {
        notImplemented: function() {
            IRFlickrShout.error.update('This isn\'t implemented yet!');
        },
        clear: function() {
            IRFlickrShout.error.update('');
        },
        update: function(str) {
            var warning = document.getElementById('error-bd');
            warning.innerHTML = str;
            if (str == '') {
                warning.style.display = 'none';
            } else {
                warning.style.display = 'block';
            }
        }
    },
    tracks: {
        submit: function() {
            IRFlickrShout.error.notImplemented();
            console.log('got submit');
            var hour = document.getElementById('hour').value;
            var minute = document.getElementById('minute').value;
            var ampm = document.getElementById('ampm').innerHTML;
            var tracks = hour + ':' + minute + ' ' + ampm;
            var lunch = new Date();
            if (ampm == 'PM') {
                hour += 12;
            }
            lunch.setHours(hour);
            lunch.setMinutes(minute);
            lunch.setSeconds(0);
            console.log(tracks + ' ' + lunch.toString());
        },
        toggleAmPm: function() {
            var ampm = document.getElementById('ampm');
            if (ampm.innerHTML == 'PM') {
                ampm.innerHTML = 'AM';
            } else {
                ampm.innerHTML = 'PM';
            }
        }
    }
};
