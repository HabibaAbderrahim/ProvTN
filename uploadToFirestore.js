const admin = require('firebase-admin');
const fs = require('fs');

// Path to your JSON file
const dataFilePath = 'output.json';

// Initialize Firebase Admin SDK
const serviceAccount = require('./proverbtn-419e0-firebase-adminsdk-z3d6f-f051ea3732.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read JSON data
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

// Upload each item in JSON as a document in Firestore
async function uploadData() {
    const collectionRef = db.collection('proverbTn'); // Replace 'proverbs' with your collection name

    for (let item of data) {
        try {
            // Add each JSON item as a document in Firestore
            await collectionRef.add(item);
            console.log('Document added successfully:', item);
        } catch (error) {
            console.error('Error adding document:', error);
        }
    }
}

uploadData().then(() => {
    console.log('Data upload complete!');
    process.exit();
});