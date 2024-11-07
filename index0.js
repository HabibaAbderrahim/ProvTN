const admin = require('firebase-admin');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Firebase Initialization
const serviceAccount = require('./proverbtn-419e0-firebase-adminsdk-z3d6f-f051ea3732.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://proverbtn-419e0-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

app.use('/Captions', express.static(path.join(__dirname, 'Captions')));

let proverbs = [];

// Load proverbs from Firebase
async function loadProverbsFromFirebase() {
    const snapshot = await db.collection('proverbTn').get();
    snapshot.forEach((doc) => {
        proverbs.push(doc.data());
    });
    console.log('Proverbs data successfully loaded from Firebase');
}
loadProverbsFromFirebase();

// Route to serve a random proverb
app.get('/random-proverb', (req, res) => {
    if (proverbs.length === 0) {
        return res.status(500).send('No proverbs found.');
    }

    const randomIndex = Math.floor(Math.random() * proverbs.length);
    const randomProverb = proverbs[randomIndex];

    res.send(`
    <html>
      <head>
        <title>Tunisian Proverb Exploration</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&display=swap" rel="stylesheet">
        <style>
  /* General styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Cairo', sans-serif;
    color: #333;
  }
  
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #eef2f3;
    padding: 20px;
  }
  
  .container {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 30px;
    text-align: center;
  }
  
  h1 {
    font-size: 2.5rem;
    color: #2a2a2a;
    margin-bottom: 15px;
    font-weight: 600;
  }
  
  p {
    font-size: 1.1rem;
    color: #555;
    line-height: 1.6;
    margin: 10px 0;
  }
  
  .proverb-prompt {
    font-weight: bold;
    font-size: 1.8rem;
    color: #4a4a4a;
    margin-top: 20px;
    border-bottom: 2px solid #2a2a2a;
    padding-bottom: 10px;
  }
  
  /* Image grid styles */
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-top: 20px;
  }
  
  .image-grid img {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  
  .image-grid img:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  /* New single hint button */
  .hint-button {
    background-color: #000000;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s ease;
  }
  
  .hint-button:hover {
    background-color: #333333;
  }
  
  /* Popup styles */
  .popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
  }
  
  .popup-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    width: 350px;
  }
  
  .close-popup,
  .action-button {
    margin-top: 20px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .close-popup {
    background-color: #333333;
  }
  
  .close-popup:hover {
    background-color: #555555;
  }
  
  .action-button {
    background-color: #007bff;
    text-decoration: none;
    margin: 10px;
  }
  
  .action-button:hover {
    background-color: #0056b3;
  }
  
  /* Footer styles */
  .footer {
    margin-top: 30px;
    font-size: 0.9rem;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }
        </style>
        <script>
          function showPopup(imageSrc) {
            document.getElementById('selectedImage').src = imageSrc;
            document.getElementById('popup').style.display = 'flex';
          }
  
          function confirmSelection(imageSrc, proverbText) {
            fetch('/save-selection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ proverb: proverbText, image: imageSrc })
            })
            .then(response => {
                if (response.ok) {
                    // alert("Selection saved!");
                    window.location.href = '/random-proverb';
                } else {
                    alert("Failed to save selection.");
                }
            });
          }
  
          function closePopup() {
            document.getElementById('popup').style.display = 'none';
          }
  
          function showHint() {
            document.getElementById('hintPopup').style.display = 'flex';
          }
  
          function closeHintPopup() {
            document.getElementById('hintPopup').style.display = 'none';
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>استكشف الأمثال التونسية من خلال الصور</h1>
          <p class="proverb-prompt">"${randomProverb.tunisan_proverb}"</p>
  
          <!-- Single Hint Button -->
          <button class="hint-button" onclick="showHint()">Show Hint</button>
  
          <!-- Hint Popup -->
          <div id="hintPopup" class="popup">
            <div class="popup-content">
              <p>${randomProverb.proverb_arabic_explaination}</p>
              <button class="close-popup" onclick="closeHintPopup()">Close</button>
            </div>
          </div>
  
          <div class="image-grid">
            <div>
              <img src="/${randomProverb.image_path_1}" alt="Proverb Image 1" onclick="showPopup(this.src)">
            </div>
            <div>
              <img src="/${randomProverb.image_path_2}" alt="Proverb Image 2" onclick="showPopup(this.src)">
            </div>
            <div>
              <img src="/${randomProverb.image_path_3}" alt="Proverb Image 3" onclick="showPopup(this.src)">
            </div>
            <div>
              <img src="/${randomProverb.image_path_4}" alt="Proverb Image 4" onclick="showPopup(this.src)">
            </div>
          </div>
          
          <div class="note">اضغط على صورة لتحديد الأفضل!</div>
  
          <div class="footer">
            <p>دعونا نستكشف الأمثال التونسية للحفاظ على تراثنا الثقافي.</p>
          </div>
        </div>
  
        <!-- Popup for image selection -->
        <div id="popup" class="popup">
          <div class="popup-content">
            <h2>اختر الصورة الأفضل</h2>
            <img id="selectedImage" src="" alt="Selected" style="width: 100%;">
            <button class="close-popup" onclick="closePopup()">إغلاق</button>
            <button class="action-button" onclick="confirmSelection(document.getElementById('selectedImage').src, '${randomProverb.tunisan_proverb}')">تأكيد الاختيار</button>
          </div>
        </div>
      </body>
    </html>
      `);
});

// Route to save selection to Firebase
app.post('/save-selection', express.json(), async(req, res) => {
    const { proverb, image } = req.body;

    try {
        await db.collection('selected_images').add({
            proverb: proverb,
            image: image,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).send('Selection saved to Firebase');
    } catch (error) {
        console.error('Error saving selection:', error);
        res.status(500).send('Error saving selection to Firebase');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});