const https = require('https');
const fs = require('fs');

const url = 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4'; // We know this one 200 OK
const dest = './public/wedding.mp4';

const args = process.argv.slice(2);
const fetchUrl = args[0] || url;

const file = fs.createWriteStream(dest);
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
};

https.get(fetchUrl, options, (response) => {
    if(response.statusCode === 301 || response.statusCode === 302) {
       console.log('Redirecting to: ' + response.headers.location);
       https.get(response.headers.location, options, (res) => {
           res.pipe(file);
           file.on('finish', () => {
               file.close();
               console.log('Download completed! Redirect followed.');
           });
       });
    } else {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download completed! ' + fetchUrl);
        });
    }
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.log('Error downloading: ' + err.message);
});
