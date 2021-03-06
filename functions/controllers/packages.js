const { db } = require("../config/admin");
const cors = require("cors")({ origin: true });

exports.getAllPackages = (request, response) => {
  db.collection("packages")
    .get()
    .then(data => {
      let packages = [];

      data.forEach(data => {
        packages.push({
          isPickedUp: data.data().isPickedUp,
          packageDescription: data.data().packageDescription,
          receivedAt: data.data().recievedAt, // not consistent, must fix
          staffName: data.data().staffName,
          tenantName: data.data().tenantName,
          packageId: data.id
        });
      });
      return response.json(packages);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getTenantPackages = (request, response) => {
  db.collection("packages")
    .where("tenantName", "==", `${request.body.handle}`)
    .get()
    .then(data => {
      let packages = [];
      data.forEach(package => {
        packages.push({
          isPickedUp: package.data().isPickedUp,
          packageDescription: package.data().packageDescription,
          receivedAt: package.data().recievedAt, // not consistent, must fix
          staffName: package.data().staffName,
          tenantName: package.data().tenantName,
          packageId: package.id
        });
      });
      return response.json(packages);
    })
    .catch(err => {
      console.log(":(");
      console.log(err);
    });
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
      .then(data => {
        const responsePackage = newPackage;
        responsePackage.packageId = data.id;
        response.json(responsePackage);
      })
      .catch(err => {
        response.status(500).json({ error: "something weng wrong!!!" });
        console.error(err);
      });
  }); // end cors
};

exports.getPackageById = (request, response) => {
  const packageId = request.body.packageId;
  console.log(packageId);

  db.collection("packages")
    .doc(packageId)
    .get()
    .then(data => {
      return response.json(data);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.updateStatus = (request, response) => {
  const packageData = {
    isPickedUp: request.body.isPickedUp,
    packageId: request.body.packageId
  };

  db.doc(`/packages/${packageData.packageId}`)
    .update({
      isPickedUp: packageData.isPickedUp
    })
    .then(res => {
      return response.status(200).json(res);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.deletePackage = (request, response) => {
  cors(request, response, () => {
    const pId = request.body.packageId;

    const document = db.doc(`/packages/${pId}`);
    document
      .get()
      .then(doc => {
        if (!doc.exists) {
          return res.status(404).json({ error: "package not found" });
        }
        return document.delete();
      })
      .then(() => {
        response.json({
          message: "package deleted successfully"
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ err: err.code });
      });
  }); // end cors
};
