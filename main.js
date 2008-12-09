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
                document.getElementById('shout-button').disabled = true;
                return IRFlickrShout.error.update('Log in to share your Flickr photos with your friends!');
            }
            var user = req.get('user').getData(),
                data = req.get('flickr_user').getData(),
                guid = user.getField(opensocial.Person.Field.ID);
            IRFlickrShout.userId.displayName = user.getDisplayName();
            data = data[guid]['flickr_user'];
            if (typeof data.nsid == "undefined" || data.nsid == '') {
                IRFlickrShout.error.update('To get started, give us a Flickr ID!');
                return IRFlickrShout.userId.toggle();
            }
            var previous = IRFlickrShout.userId.value,
                id = IRFlickrShout.userId.value = data.nsid;
            if (previous != id) {
                IRFlickrShout.shout.start();
            }
            document.getElementById('user_id').value = id;
            if (id == '' || !id) {
                id = 'not set';
            }
            document.getElementById('view-id-data').innerHTML = 'Your Flickr ID is ' + id + '.';
            IRFlickrShout.userId.toggle(true);
        },
        toggle: function(a) {
            var f = document.getElementById('entry-form'),
                v = document.getElementById('view-id');
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
            var user_id = document.getElementById('user_id').value,
                req = opensocial.newDataRequest();
            IRFlickrShout.error.clear();
            req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'flickr_user', {nsid: user_id}));
            req.send(IRFlickrShout.userId.update); 
            return false;
        }
    },
    shout: {
        photos: [],
        complete: {},
        start: function() {
            var id;
            IRFlickrShout.shout.photos = [];
            IRFlickrShout.error.clear();
            if (IRFlickrShout.userId.value) {
                id = IRFlickrShout.userId.value;
            } else {
                IRFlickrShout.error.update('Please specify your Flickr ID :)');
            }
            var url = 'http://api.flickr.com/services/feeds/photos_public.gne?id=' + id + '&lang=en-us',
                params = {};
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
            params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
            gadgets.io.makeRequest(url, IRFlickrShout.shout.ready, params);
        },
        ready: function(obj) {
            var html = '';
            if (!obj.data) {
                IRFlickrShout.error.update('Invalid Flickr ID, why not try another?');
                html = 'Nothing to show.';
            } else {
                var items = obj.data.items;
                if (!items) {
                    IRFlickrShout.error.update('Didn\'t find any photos :(');
                    html = 'No photos! Refresh to update.';
                } else {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i],
                            activity = {},
                            checkbox = 'photo_' + i;
                        activity[opensocial.Activity.Field.TITLE] = IRFlickrShout.userId.displayName + ' posted <a href="' + item.link + '">' + item.title + '</a> to Flickr.';
                        activity[opensocial.Activity.Field.BODY] = item.link;
                        activity[opensocial.Activity.Field.URL] = item.link;
                        if (IRFlickrShout.shout.photos.length % 2 == 0) {
                            html += '<div class="clear-both"></div>';
                        }
                        IRFlickrShout.shout.photos.push(activity);
                        html += '<div class="update">';
                        html += '<div><label for="' + checkbox + '" title="Selected photos will be posted as activity">';
                        html += 'Post this photo? <input type="checkbox" name="' + checkbox + '" id="' + checkbox + '" checked="checked">';
                        html += '</label></div>';
                        html += '<div>' + activity[opensocial.Activity.Field.TITLE] + '</div>';
                        html += item.content;
                        html += '</div>';
                    }
                }
            }
            document.getElementById('recent-photos').innerHTML = html;
            return false;
        },
        submit: function() {
            var p = IRFlickrShout.shout.photos,
                c = IRFlickrShout.shout.complete,
                l = p.length,
                i = c['total'] = c['uploaded'] = 0,
                act;
            for (; i < l; i++) {
                if (document.getElementById('photo_' + i).checked) {
                    act = opensocial.newActivity(p[i]);
                    opensocial.requestCreateActivity(act, opensocial.CreateActivityPriority.HIGH, IRFlickrShout.shout.callback);
                    c['total']++;
                }
            }
            return false;
        },
        callback: function(req) {
            var c = IRFlickrShout.shout.complete;
            c['uploaded']++;
            document.getElementById('shout-status').innerHTML = c['uploaded'] + '/' + c['total'] + ' posted!';
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
