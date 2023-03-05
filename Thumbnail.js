// The code in this file will load on every page of your site
const { Configuration, OpenAIApi } = require("openai");
import { getOpenAIKey } from 'backend/aModule';

var open_ai_key;
var configuration;

getOpenAIKey().then(key => { open_ai_key = key });
getOpenAIKey().then(key => { configuration = new Configuration({ apiKey: key }); });
const openai = new OpenAIApi(configuration);

const setImage = (url) => {
    $w("#image1").src = url;
    $w("#image1").show();
    console.log(url);
}

const getImage = async (prompt) => {
    fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + open_ai_key
        },
        body: JSON.stringify({
            "prompt": prompt,
            "n": 1,
            "size": "512x512"
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.json().toString());
        }
    }).then(data => {
        if (data.data) {
            setImage(data.data[0].url);
        } else { console.log("Error: The 'data' property is not found in the response data. Please check the API documentation and verify that the response is in the expected format."); }
    }).catch(err => {
        console.log(err);
    });
	$w('#button18').enable();
}

export function generate(event) {
	$w('#button18').disable();
	$w("#image1").hide();
    $w("#image1").src = "";
    getImage($w('#input65').value); 
}
