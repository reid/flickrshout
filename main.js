var IRFlickrShout = {
    start: function() {
        IRFlickrShout.error.clear();
        IRFlickrShout.userId.start();
    },
    userId: {
        value: null,
        displayName: null,
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
            if (req.hadError()) {
                // User is probably logged out!
                document.getElementById('flickr-info').innerHTML = 'You are logged out.';
                document.getElementById('recent-photos').innerHTML = 'Nothing to show.';
                return IRFlickrShout.error.update('Log in to share your Flickr photos with your friends!');
            }
            var user = req.get('user').getData();
            IRFlickrShout.userId.displayName = user.getDisplayName();
            var guid = user.getField(opensocial.Person.Field.ID);
            var data = req.get('flickr_user').getData();
            data = data[guid]['flickr_user'];
            if (typeof data.nsid == "undefined" || data.nsid == '') {
                IRFlickrShout.error.update('To get started, give us a Flickr ID!');
                return IRFlickrShout.userId.toggle();
            }
            var previous = IRFlickrShout.userId.value;
            var id = IRFlickrShout.userId.value = data.nsid;
            document.getElementById('view-id-data').innerHTML = 'Your Flickr ID is ' + id + '.';
            document.getElementById('user_id').innerHTML = id;
            if (previous != id && id != '') {
                IRFlickrShout.shout.start();
                IRFlickrShout.userId.toggle(true);
            }
        },
        toggle: function(a) {
            var f = document.getElementById('entry-form');
            var v = document.getElementById('view-id');
            if (f.style.display == 'none' && !a) {
                f.style.display = 'block';
                v.style.display = 'none';
            } else {
                f.style.display = 'none';
                v.style.display = 'block';
            }
            return false;
        },
        submit: function() {
            IRFlickrShout.error.clear();
            var user_id = document.getElementById('user_id').value;
            var req = opensocial.newDataRequest();
            req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'flickr_user', {nsid: user_id}));
            req.send(IRFlickrShout.userId.update); 
            return false;
        }
    },
    shout: {
        photos: [],
        uploaded: 0,
        start: function() {
            IRFlickrShout.error.clear();
            if (IRFlickrShout.userId.value) {
                var id = IRFlickrShout.userId.value;
            } else {
                IRFlickrShout.error.update('Please specify your Flickr ID :)');
            }
            var url = "http://api.flickr.com/services/feeds/photos_public.gne?id=" + id + "&lang=en-us";
            var params = {};
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
            params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
            gadgets.io.makeRequest(url, IRFlickrShout.shout.ready, params);
        },
        ready: function(obj) {
            console.log(obj);
            var html = '';
            if (!obj.data) {
                IRFlickrShout.error.update('Invalid Flickr ID, why not try another?');
                html = 'Nothing to show.';
                return false;
            }
            var items = obj.data.items;
            if (!items) {
                IRFlickrShout.error.update('Didn\'t find any photos :(');
                html = 'No photos! Refresh to update.';
                return false;
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var obj = {};
                obj[opensocial.Activity.Field.TITLE] = IRFlickrShout.userId.displayName + ' posted <a href="' + item.link + '">' + item.title + '</a> to Flickr.';
                obj[opensocial.Activity.Field.BODY] = item.link;
                obj[opensocial.Activity.Field.URL] = item.link;
                IRFlickrShout.shout.photos.push(obj);
                html += '<div class="update">';
                html += obj[opensocial.Activity.Field.TITLE] + '<br>';
                html += item.content;
                html += '</div>';
            }
            document.getElementById('recent-photos').innerHTML = html;
        },
        submit: function() {
            IRFlickrShout.shout.uploaded = 0;
            var p = IRFlickrShout.shout.photos;
            for (var i = 0; i < p.length; i++) {
                var a = opensocial.newActivity(p[i]);
                opensocial.requestCreateActivity(a, opensocial.CreateActivityPriority.HIGH, IRFlickrShout.shout.callback);
            }
            return false;
        },
        callback: function(req) {
            console.log(req);
            IRFlickrShout.shout.uploaded++;
            document.getElementById('shout-status').innerHTML = IRFlickrShout.shout.uploaded + '/' + IRFlickrShout.shout.photos.length + ' posted!';
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
