Posts = new Mongo.Collection('posts');

Posts.allow({
  update : function (userId, doc) {

      return ownsDocument(userId, doc);

  },
  remove : function (userId, doc) {

      return ownsDocument(userId, doc);

  }
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    return(_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
  //    check(Meteor.userId(), String);
  //    check(postAttributes, {
  //      title: String,
  //      url: String
  //    });
  //    
  //    var postWithSameLink = Posts.findOne({url: postAttributes.url});
  //    if(postWithSameLink) {
  //      return {
  //        postExists: true,
  //        _id: postWithSameLink._id
  //      };
  //    }
  //    
  //    var user = Meteor.user();
  //    var post = _.extend(postAttributes, {
  //      userId: user._id,
  //      author: user.username,
  //      submitted: new Date()
  //    });
  //    
  //    var postId =  Posts.insert(post);
  //    
  //    return {
  //      _id: postId
  //    };
    
    var user = Meteor.user();
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");
    
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');
    
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302,
                            'This link has already been posted',
                            postWithSameLink._id);
    }
    
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime
    });
    
    var postId = Posts.insert(post);
    
    return { 
      _id: postId
    };
  }
});