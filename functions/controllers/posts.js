const { db } = require('../config/admin');

exports.getAllPosts = (request, response) => {
    db.collection('posts').get()
        .then((data) => {
            let posts = [];

            data.forEach((doc) => {
                posts.push({
                    postID: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    receivedBy: doc.data().recievedBy
                });
            });
            return response.json(posts);
        })
        .catch((err) => console.log(err));
}

exports.createPost = (request, response) => {
    const newPost = {
        body: request.body.body,
        userHandle: request.user.handle,
        recievedBy: new Date().toISOString()
    };

    db.collection('posts').add(newPost)
        .then((doc) => {
            response.status(201).json( { message: `document ${doc.id} created successfully`});
        })
        .catch((err) => {
            response.status(500).json({ error: 'something weng wrong!!!'});
            console.error(err);
        });
}

exports.deletePost = (request, response) => {
    const document = db.doc(`/posts/${request.params.postID}`);
    document.get()
        .then(doc => {
            if (!doc.exists) {
                return response.status(404).json({error: 'post not found'});
            } 
            if (doc.data().userHandle !== request.user.handle) {
                return response.status(403).json({error: 'unauthorized'});
            } else {
                return document.delete();
            }
        })
        .then(() => {
            response.json({message: 'post successfuly deleted'});
        })
        .catch(err => {
            console.log(err);
        })
}

