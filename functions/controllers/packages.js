const { db } = require("../config/admin");
const cors = require("cors")({ origin: true });

exports.getAllPackages = (request, response) => {
  db.collection("packages")
    .get()
    .then(data => {
      let packages = [];

      data.forEach(doc => {
        packages.push({
          packageID: doc.id,
          isPickedUp: doc.data().isPickedUp,
          packageDescription: doc.data().packageDescription,
          receivedAt: doc.data().recievedAt, // not consistent, must fix
          staffName: doc.data().staffName,
          tenantName: doc.data().tenantName
        });
      });
      return response.json(packages);
    })
    .catch(err => console.log(err));
};

exports.newPackage = (request, response) => {
  cors(request, response, () => {
    const newPackage = {
      tenantName: request.body.tenantName,
      packageDescription: request.body.packageDescription,
      staffName: request.body.staffName,
      recievedAt: new Date().toISOString(),
      isPickedUp: false
    };
    console.log("NEW PACKAGE");
    console.log(newPackage);

    db.collection("packages")
      .add(newPackage)
      .then(doc => {
        response
          .status(201)
          .json({ message: `document ${doc.id} created successfully` });
      })
      .catch(err => {
        response.status(500).json({ error: "something weng wrong!!!" });
        console.error(err);
      });
  }); // end cors
};

exports.deletePackage = (request, response) => {
  const document = db.doc(`/packages/${request.params.postID}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: "post not found" });
      }
      if (doc.data().userHandle !== request.user.handle) {
        return response.status(403).json({ error: "unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      response.json({ message: "post successfuly deleted" });
    })
    .catch(err => {
      console.log(err);
    });
};
