People = new Meteor.Collection('people');

app = {};
app.addCurrentUser = function() {
  var user_info = Meteor.user().services.google;
  var data = {
    google_id: user_info.id,
    email: user_info.email,
    first_name: user_info.given_name,
    last_name: user_info.family_name,
    avatar_url: user_info.picture,
    status: 'online'
  };
  People.insert(data);
}

app.isNewUser = function() {
  var user = Meteor.user();
  if (user == null) return false;

  var user_info = user.services.google;
  var query = People.findOne({google_id:user_info.id});
  if (query === undefined) {
    return true;
  } else {
    return false;
  }
}

if (Meteor.isClient) {
  Handlebars.registerHelper('selected', function(val1, val2) {
    return val1 == val2 ? ' selected' : '';
  });

  Template.person.isCurrentUser = function () {
    if (Meteor.user() == null) return false;
    return this.google_id == Meteor.user().services.google.id;
  };

  Template.person.events({
    'change #status': function(event, context) {
      People.update(context.data._id,{$set: {status: event.target.value}});
    },
    'change #contactOn': function(event, context) {
      People.update(context.data._id,{$set: {contactOn: event.target.value}});
    }
  });

  Template.status_board.new_user = function() {
    return app.isNewUser();
  };

  Template.status_board.people = function() {
    return People.find();
  };

  Template.status_board.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    },
    'click #add_yourself': function() {
      app.addCurrentUser();
    },
    'click #remove_all': function() {
      var people = People.find().fetch();
      people.forEach(function(p) { People.remove({_id:p._id}); });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
