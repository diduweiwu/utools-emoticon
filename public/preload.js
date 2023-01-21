const fs = require('fs')
const http = require('http');
const https = require('https');

window.copyImage = (url) => {
    const nameArr = url.split("/")
    let fileName = nameArr[nameArr.length - 1]

    const filePath = `${utools.getPath("temp")}${fileName}`
    let client = http
    if (url.startsWith("https")) {
        client = https
    }
    client.get(url, res => {
        res.pipe(fs.createWriteStream(filePath))
            .on('close', () => {
                let copyResult = false
                if (filePath.endsWith(".jpg")) {
                    copyResult = utools.copyImage(filePath)
                } else {
                    copyResult = utools.copyFile(filePath)
                }
                copyResult && utools.hideMainWindow()
            })
    });
    console.log(filePath)
}


