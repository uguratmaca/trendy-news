const fs = require('fs');
const https = require('https');
const querystring = require('querystring');

const apiUrl = 'https://api.hurriyet.com.tr/v1/';
const apiKey = '&apikey=ce77a6e572154431ac620c8ee33103c5';
const today = new Date();

let dateFilter = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + today.getDate();
let fileLocation = 'trends/' + dateFilter + '-trends.txt';

fs.readFile(fileLocation,

    function (err, data) {
        if (err) throw err;

        let dataArr = data.toString('utf8').split('\n');

        for (let i in dataArr) {
            let val = dataArr[i];
            httpGet(val);
        }
    });

function createFile(filename, content) {

    let name = '_posts/' + dateFilter + '-' + filename + '.md';
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
                fileContent += '\ntitle: ' + word;
                fileContent += '\nnewsTitle: ' + newsInstance.Title;
                fileContent += '\ndescription: ' + newsInstance.Description;
                fileContent += "\ntags: ['en son haberler','en çok aratılanlar','" + word + "']";
                fileContent += '\nreference: ' + newsInstance.Url;
                fileContent += '\ndate: ' + newsInstance.StartDate;
                fileContent += '\n---\n';

                fileContent += newsInstance.Text;

                createFile(querystring.escape(word.replace(/ /g, '-')), fileContent);
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