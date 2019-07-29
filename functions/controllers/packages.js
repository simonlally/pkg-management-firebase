const { db } = require('../config/admin');

exports.getAllPackages = (request, response) => {
    db.collection('packages').get()
        .then((data) => {
            let packages = [];

            data.forEach((doc) => {
                packages.push({
                    packageID: doc.id,
                    pickedUp: doc.data().pickedUp,
                    recipient: doc.data().recipient,
                    recieved: doc.data().received,
                    receivedAt: doc.data().receivedAt,
                });
            });
            return response.json(packages);
        })
        .catch((err) => console.log(err));
}

exports.newPackage = (request, response) => {
    const newPost = {
        body: request.body.body,
        userHandle: request.user.handle,
        recievedBy: new Date().toISOString()
    };

    db.collection('packages').add(newPost)
        .then((doc) => {
            response.status(201).json( { message: `document ${doc.id} created successfully`});
        })
        .catch((err) => {
            response.status(500).json({ error: 'something weng wrong!!!'});
            console.error(err);
        });
}

exports.deletePackage = (request, response) => {
    const document = db.doc(`/packages/${request.params.postID}`);
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

