const functions = require("firebase-functions");
const express = require("express");
const app = express();
const { db } = require("./config/admin");
const cors = require("cors");
app.use(cors());

const {
  getAllPackages,
  newPackage,
  getTenantPackages,
  updateStatus,
  getPackageById
} = require("./controllers/packages");

const {
  signup,
  login,
  signout,
  isStaff,
  getAllUsers
} = require("./controllers/users");

// user routes
app.post("/signup", signup);
app.post("/login", login);

app.get("/logout", signout);
app.get("/isstaff", isStaff);
app.get("/getallusers", getAllUsers);

// package routes
app.get("/packages", getAllPackages);

app.post("/newpkg", newPackage);
app.post("/getpackages", getTenantPackages);
app.post("/updatestatus", updateStatus);
app.post("/getpackagebyid", getPackageById);

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
