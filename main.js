var IRFlickrShout = {
    start: function() {
        IRFlickrShout.error.clear();
        IRFlickrShout.sbox.start();
        IRFlickrShout.userId.start();
    },
    userId: {
        value: null,
        start: function() {
            IRFlickrShout.userId.update();
        },
        update: function() {
            var req = opensocial.newDataRequest();
            req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'user');
            req.add(req.newFetchPersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'flickr_user'), 'flickr_user');
            req.send(IRFlickrShout.userId.callback);
        },
        callback: function(req) {
            var user = req.get('user').getData();
            var guid = user.getField(opensocial.Person.Field.ID);
            var data = req.get('flickr_user').getData();
console.log(user);
console.log(data);
            data = data[guid]['flickr_user'];
console.log(data);
            if (typeof data.nsid == "undefined") {
                return IRFlickrShout.userId.toggle();
            }
            if (IRFlickrShout.userId.value != data.nsid) {
                IRFlickrShout.sbox.start();
            }
            var id = IRFlickrShout.userId.value = data.nsid;
            document.getElementById('view-id-data').innerHTML = 'Your Flickr ID is ' + id + '.';
        },
        toggle: function() {
            var f = document.getElementById('entry-form');
            var v = document.getElementById('view-id');
            if (f.style.display == 'none') {
                f.style.display = 'block';
                v.style.display = 'none';
            } else {
                f.style.display = 'none';
                v.style.display = 'block';
            }
            return false;
        },
        submit: function() {
            console.log('got submit for user');
            var user_id = document.getElementById('user_id').value;
            var req = opensocial.newDataRequest();
            req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'flickr_user', {nsid: user_id}));
            req.send(IRFlickrShout.userId.update); 
            return false;
        }
    },
    sbox: {
        start: function() {
            if (IRFlickrShout.userId.value) {
                var id = IRFlickrShout.userId.value;
            } else {
                var id = '42995562@N00';
            }
            var url = "http://api.flickr.com/services/feeds/photos_public.gne?id=" + id + "&lang=en-us";
            var params = {};
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
    }
};
