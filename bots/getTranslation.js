const axios = require("axios").default;
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const ENV_FILE = path.join(__dirname, "../.env");
require("dotenv").config({ path: ENV_FILE });


let endpoint = process.env.endPoint;

const getTranslation = async (text, to, from) => {
    try {
        let response = await axios({
            baseURL: endpoint,
            url: "/translate",
            method: "post",
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.translatorKey,
                "Ocp-Apim-Subscription-Region": "centralindia",
                "Content-type": "application/json",
                "X-ClientTraceId": uuidv4().toString(),
            },
            params: {
                "api-version": "3.0",
                from,
                to: [to],
            },
            data: [
                {
                    text,
                },
            ],
            responseType: "json",
        });
        return response.data[0].translations[0].text;
    } catch (err) {
        console.log(err);
        throw new Error("Error in translating the text");
    }
};

module.exports = getTranslation;
