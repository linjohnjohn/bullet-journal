const fs = require('fs');

if (process.env.FIREBASE_ENV === 'production') {
    fs.copyFileSync('src/firebase.prod.config.js', 'src/firebase.config.js')
} else {
    fs.copyFileSync('src/firebase.dev.config.js', 'src/firebase.config.js')
}