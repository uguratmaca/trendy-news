const fs = require('fs');
const https = require('https');
const querystring = require('querystring');
const mkdirp = require('mkdirp');

const apiUrl = 'https://api.hurriyet.com.tr/v1/';
const apiKey = '&apikey=ce77a6e572154431ac620c8ee33103c5';
const today = new Date();

let dateFilter = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + today.getDate();
let fileLocation = 'trends/' + dateFilter + '-trends.txt';

mkdirp('_posts/' + dateFilter, function (err) {
    console.log('new folder created!');
});

function readFile(err, data) {
    if (err) throw err;

    let dataArr = data.toString('utf8').split('\n');

    for (let i in dataArr) {
        let val = dataArr[i];
        setTimeout(() => {
            httpGet(val);
        }, i * 500);
    }
}

fs.readFile(fileLocation, readFile);

function createFile(filename, content) {

    let name = '_posts/' + dateFilter + '/' + dateFilter + '-' + filename + '.md';
    fs.writeFile(name,
        content,
        function (err) {
            if (err) throw err;
            console.log(filename + ' created successfully!');
        });
}


var callback = function (word) {
    return function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var obj = JSON.parse(str);

            if (obj && obj.Count > 0 && obj.List && obj.List[0]) {

                let newsInstance = obj.List[0];

                let fileContent = '---\nlayout: post\ncategory: articles';
                fileContent += '\ntitle: "' + word + '"';
                fileContent += '\nnewsTitle: "' + newsInstance.Title.replace(/"/g, '') + '"';

                let description = newsInstance.Description || newsInstance.Text;

                fileContent += '\ndescription: "' + description.replace(/"/g, '') + '"';
                fileContent += "\ntags: ['en son haberler','en çok aratılanlar','" + word + "']";
                fileContent += '\nreference: "' + newsInstance.Url.replace(/"/g, '') + '"';
                fileContent += '\ndate: "' + newsInstance.StartDate.replace(/"/g, '') + '"';

                if (newsInstance.Files && newsInstance.Files[0]) {
                    if (newsInstance.Files[0].FileUrl.endsWith('.jpg')) {
                        fileContent += '\nimage: "' + newsInstance.Files[0].FileUrl.replace(/"/g, '') + '"';
                    }
                }

                fileContent += '\n---\n';
                fileContent += '\n';

                fileContent += newsInstance.Text.replace(/"/g, '');

                createFile(querystring.escape(word.replace(/ /g, '-')), fileContent);
            } else {
                console.log("\nCouldn't find related result for: " + word + "\n");
            }
        });
    }
}



function httpGet(trendWord) {
    trendWord = trendWord.replace(/[\n\r]/g, '');

    let urlParams = querystring.escape(trendWord) + '?%24top=1' + apiKey;
    let endpoint = apiUrl + 'search/' + urlParams;
    var request = https.get(endpoint, callback(trendWord));

    request.on('error', function (err) {
        console.error('Error with the request:', err.message);
    });

    request.end();
}