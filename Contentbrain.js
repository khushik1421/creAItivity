const { Configuration, OpenAIApi } = require("openai");
import { getOpenAIKey2 } from 'backend/aModule';

var open_ai_key;
var configuration;

getOpenAIKey2().then(key => { open_ai_key = key });
getOpenAIKey2().then(key => { configuration = new Configuration({ apiKey: key }); });
const openai = new OpenAIApi(configuration);

const setText = (text) => {
    $w('#textBox1').value = text;
}

const getContent = async (prompt) => {
    fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ open_ai_key
        },
        body: JSON.stringify({
            "prompt": prompt,
            "max_tokens": 1000,
            "model": "text-davinci-003"
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }).then(data => {
        if (data.choices) {
            setText(data.choices[0].text);
        } else { console.log("Error: The 'choices' property is not found in the response data. Please check the API documentation and verify that the response is in the expected format."); }

	}).catch(err => {
        console.log(err);
    });
	$w('#button18').enable();
}

export function create(event) {
	$w('#button18').disable();
	var sentiment = "friendly";
    if ($w('#input67').value != "") {
        sentiment = $w('#input67').value;
    }

    const prompt = `Write a script in the style of a YouTube video about ${$w('#input65').value}. The video should be under ${$w('#input66').value} seconds long. The script should feel ${sentiment} in nature.`;
    console.log(prompt)
    getContent(prompt);
}
