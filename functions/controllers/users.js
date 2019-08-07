const { db } = require("../config/admin");
const config = require("../config/config");
const cors = require("cors")({ origin: true });
const firebase = require("firebase");
firebase.initializeApp(config);

exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
    isStaff: request.body.isStaff
  };

  // validation
  let errors = {};
  // validate email
  if (isEmpty(newUser.email)) {
    errors.email = "Email cannot be empty string";
  } else if (!isEmailValid(newUser.email)) {
    errors.email = "Not a valid email address";
  }
  // validate password
  if (isEmpty(newUser.password)) {
    errors.password = "password cannot be empty!";
  } else if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  // validate handle
  if (isEmpty(newUser.handle)) {
    errors.handle = "handle cannot be empty!";
  }
  // if we have errors
  if (Object.keys(errors).length > 0) {
    return resizeBy.status(400).json(errors);
  }

  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      //even if doc doesn't exist we'll still have a snapshot
      if (doc.exists) {
        //handle already taken
        return response
          .status(400)
          .json({ handle: "this handle has been already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      // if we get to this promise user has been created
      return data.user.getIdToken();
    })
    .then(retToken => {
      token = retToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        receivedAt: new Date().toISOString(),
        userId,
        isStaff: newUser.isStaff
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch(err => {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email is already is use" });
      } else {
        return response.status(500).json({ error: err.code });
      }
    });
};

exports.getAllUsers = (request, response) => {
  db.collection("users")
    .get()
    .then(data => {
      let users = [];

      data.forEach(doc => {
        users.push({
          userId: doc.id,
          tenantName: doc.data().userHandle,
          email: doc.data().email
        });
      });
      return response.json(users);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.isStaff = (request, response) => {
  db.collection("users")
    .get()
    .then(data => {
      let users = [];

      data.forEach(doc => {
        users.push({
          userId: doc.id,
          userHandle: doc.data().userHandle,
          isStaff: doc.data().isStaff,
          email: doc.data().email
        });
      });
      return response.json(users);
    })
    .catch(err => console.log(err));
};

exports.login = (request, response) => {
  cors(request, response, () => {
    const user = {
      email: request.body.email,
      password: request.body.password
    };

    // validate
    let errors = {};
    if (isEmpty(user.email)) {
      errors.email = "email cannot be empty";
    }
    if (isEmpty(user.password)) {
      errors.password = "password cannot be empty";
    }

    if (Object.keys(errors).length > 0) {
      return resizeBy.status(400).json(errors);
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(data => {
        return data.user.getIdToken();
      })
      .then(token => {
        return response.json({ token });
      })
      .catch(err => {
        console.log("THIS IS THE ERROR?");
        console.log(err);
        if (error.code === "auth/wrong-password") {
          return response.status(403).json({ message: "invalid credentials" });
        } else {
          console.log(err);
          return response.status(500).json({ error: err.code });
        }
      });
  }); //end cors
};

exports.signout = (request, response) => {
  cors(request, response, () => {
    console.log("RES RES RES RES");
    console.log(JSON.stringify(request.headers));
    console.log(request.headers.authorization);
    firebase
      .auth()
      .signOut()
      .then(
        function() {
          console.log("Signed Out");
          return response.status(200).json({ message: "kewl beans" });
        },
        function(error) {
          console.error("Sign Out Error", error);
          return response.status(418);
        }
      );
  }); //end cors
};

// helper functions
const isEmailValid = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};
