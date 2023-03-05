// The code in this file will load on every page of your site
const { Configuration, OpenAIApi } = require("openai");
import axios from 'axios'
import { getAssemblyAIKey, getOpenAIKey, getRapidAPIKey, getRapidAPIHost } from 'backend/aModule';

var rapid_api_key, rapid_api_host, open_ai_key;
var configuration;

getOpenAIKey().then(key => { open_ai_key = key });
getOpenAIKey().then(key => { configuration = new Configuration({ apiKey: key }); });
const openai = new OpenAIApi(configuration);

getRapidAPIKey().then(key => {
    rapid_api_key = key;
});

getRapidAPIHost().then(host => {
    rapid_api_host = host;
});

var assembly;

getAssemblyAIKey().then(key => {
    assembly = axios.create({
        baseURL: "https://api.assemblyai.com/v2",
        headers: {
            authorization: key,
        },
    });
});

const refreshInterval = 2000;
const getTranscript = async (url) => {
    const options = {
        method: "GET",
        url: "https://t-one-youtube-converter.p.rapidapi.com/api/v1/createProcess",
        params: {
            url: url,
            format: "mp3",
            responseFormat: "json",
            lang: "en",
        },
        headers: {
            "X-RapidAPI-Key": rapid_api_key,
            "X-RapidAPI-Host": rapid_api_host,
        },
    };
    const res = await axios.request(options);
    if (res.status === 200) {
        const link = res.data.file;
        const response = await assembly.post("/transcript", {
            audio_url: link,
        }).catch((err) => console.error(err));

        const checkCompletionInterval = setInterval(async () => {
            const transcript = await assembly.get(`/transcript/${response.data.id}`)
            const transcriptStatus = transcript.data.status
            if (transcriptStatus !== "completed") {
                setText(`Transcription Status : ${transcriptStatus}`);
            } else if (transcriptStatus === "completed") {
                setText("Transcription completed!");
                let transcriptText = transcript.data.text
                if ($w("#dropdown1").value != "") {
                    var promp = `Translate this into 1.${$w("#dropdown1").value}\n${transcriptText}\n 1.`;
                    console.log(promp)
                    fetch('https://api.openai.com/v1/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + open_ai_key
                        },
                        body: JSON.stringify({
                            "prompt": promp,
                            "temperature": 0,
                            "max_tokens": 1000,
							"model": "text-davinci-003"
                        })
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error(response.json().toString());
                        }
                    }).then(data => {
                        if (data.choices) {
                            // Display the response on the website
                            setText(data.choices[0].text);
                        } else {
                            // Handle the error if the 'choices' property is not found
                            console.log("Error: The 'choices' property is not found in the response data. Please check the API documentation and verify that the response is in the expected format.");
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    setText(transcriptText);
                }
                clearInterval(checkCompletionInterval)
            }
        }, refreshInterval)
    }
	$w('#button18').enable();
}

const setText = (text) => {
    $w("#textBox1").value = `${text}`;
}

export function transcribe(event) {
	$w('#button18').disable();
	var url = $w("#input65").value;
    getTranscript(url);
}
