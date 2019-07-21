const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const { db } = require('./config/admin');

const { getAllPosts, createPost, deletePost } = require('./controllers/posts');
const { signup, login } = require('./controllers/users');
const fireauth = require('./auth/fireauth');


app.use(cors());

// Post routes
app.get('/posts', getAllPosts);
app.post('/post', fireauth, createPost);
app.delete('/post/:postID', fireauth, deletePost);
// user routes
app.post('/signup', signup);
app.post('/login', login);

 
exports.api = functions.https.onRequest(app);

exports.createNotification = functions.firestore.document('users/{userHandle}')
    .onCreate((snapshot)=> {
        db.doc(`/user/${snapshot.data.handle}`).get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        read: false,
                        postID: doc.id
                    });
                }
            })
            .then(()=> {
                return;
            })
            .catch(err => {
                console.log(err);
                return;
            })
    })

