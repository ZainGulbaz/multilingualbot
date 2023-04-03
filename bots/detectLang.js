const path = require("path");
const ENV_FILE = path.join(__dirname, "../.env");
require("dotenv").config({ path: ENV_FILE });
const { v4: uuidv4 } = require("uuid");
const request = require("request");

const subscriptionKey = process.env.translatorKey;
var endpoint = process.env.endPoint;


function detectLanguage(text) {

    return new Promise((resolve, reject) => {

        let options = {
            method: 'POST',
            baseUrl: endpoint,
            url: 'detect',
            qs: {
                'api-version': '3.0',
            },
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': "centralindia",
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            body: [{
                text
            }],
            json: true,
        };

        request(options, function (err, res, body) {
            if (err) reject(err);
            resolve(JSON.stringify(body, null, 4));
        });
    })
};


module.exports = detectLanguage;