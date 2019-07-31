const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();
const { db } = require("./config/admin");

const { getAllPackages, newPackage } = require("./controllers/packages");
const { signup, login, signout, isStaff } = require("./controllers/users");

// CORS
app.use(cors());

// user routes
app.post("/signup", signup);
app.post("/login", login);

app.get("/logout", signout);
app.get("/isstaff", isStaff);

// package routes
app.get("/packages", getAllPackages);
app.post("/newpkg", newPackage);

exports.api = functions.https.onRequest(app);

exports.createNotification = functions.firestore
  .document("users/{userHandle}")
  .onCreate(snapshot => {
    db.doc(`/user/${snapshot.data.handle}`)
      .get()
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
      .then(() => {
        return;
      })
      .catch(err => {
        console.log(err);
        return;
      });
  });
