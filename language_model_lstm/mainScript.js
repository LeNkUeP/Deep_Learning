// Placeholder für die zukünftige Funktionalität der Buttons und Wortvorhersage
document.getElementById('vorhersage').onclick = function() {
    vorhersage();
};
document.getElementById('weiter').onclick = function() {
    weiter();
};
document.getElementById('auto').onclick = function() {
    auto(); 
};
document.getElementById('stopp').onclick = function() {
    stop();
};
document.getElementById('reset').onclick = function() {
    document.getElementById('prompt').value = '';
    resetWords();
    resetAllButtons();
};

let isAutoRunning = false;  // Flag, um den Zustand von auto() zu verwalten
let totalLogProb = 0;
let wordCount = 0;

for (let i = 1; i <= 9; i++) {
    document.getElementById("word" + i).on;
}

function sendTextRequest(text){
    const requestBody = {
        "text": text
    };
    
    fetch('https://nextwordapi.flayinahook.de/predictLennart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    }).then(async response => response.json()).then(data => {
        setWords(data)
        //updatePerplexity(data);
        return data;
    }).catch(error => console.error('Error:', error)); 
}

function addWordToPrompt(newWord){
    document.getElementById("prompt").value = document.getElementById("prompt").value.trim() + " " + newWord;
}

async function auto(){
    newWord = document.getElementById("word1").innerHTML.split('(')[0];
    if(!isAutoRunning && newWord != ""){
        resetAllButtons();
        document.getElementById('auto').disabled = true;
        document.getElementById('stopp').disabled = false;
        isAutoRunning = true;
        while (isAutoRunning) {
            await weiter();  // Warte auf Abschluss von weiter()
            await delay(500);
        }
    }
}

function stop(){
    isAutoRunning = false;
    activateAllButtons();
    document.getElementById('stopp').disabled = true;
}

function onWordChosen(text){
    newWord = text.innerHTML.split('(')[0];
    if(newWord != ""){
        addWordToPrompt(newWord);
        vorhersage();
    }
}

async function weiter(){
    newWord = document.getElementById("word1").innerHTML.split('(')[0];
    if(newWord != ""){
        addWordToPrompt(newWord);
        vorhersage();
    }
}

function vorhersage(){
    text = document.getElementById("prompt").value
    if(text != ""){
        words = text.trim().split(' ');
        lastWord = words[words.length - 1];
        sendTextRequest(text.trim())
        if(!isAutoRunning){
            document.getElementById('weiter').disabled = false;
            document.getElementById('auto').disabled = false;
        }
    }
}

function setWords(data){
    for (let i = 1; i <= 9; i++) {
        document.getElementById("word" + i).innerHTML = "" + data.predictions[i-1].word + " (" + Math.round(data.predictions[i-1].confidence*100)/100 + ")";
    }
}

function resetWords(){
    for (let i = 1; i <= 9; i++) {
        document.getElementById("word" + i).innerHTML = "";
    }
}

// Funktion zur Verzögerung
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onPromptChange(text){
    if(text == "" && !document.getElementById('vorhersage').disabled){
        resetWords();
        resetAllButtons();
    }else if(text != "" && document.getElementById('vorhersage').disabled){
        document.getElementById('vorhersage').disabled = false;
        document.getElementById('reset').disabled = false;
    }
}

function resetAllButtons(){
    document.getElementById('vorhersage').disabled = true;
    document.getElementById('weiter').disabled = true;
    document.getElementById('auto').disabled = true;
    document.getElementById('stopp').disabled = true;
    document.getElementById('reset').disabled = true;
}

function activateAllButtons(){
    document.getElementById('vorhersage').disabled = false;
    document.getElementById('weiter').disabled = false;
    document.getElementById('auto').disabled = false;
    document.getElementById('stopp').disabled = false;
    document.getElementById('reset').disabled = false;
}

function updatePerplexity(data) {
    let bestPrediction = data.predictions[0];
    let logProb = Math.log(bestPrediction.confidence);
    totalLogProb += logProb;
    wordCount++;
    let perplexity = Math.exp(-totalLogProb / wordCount);
    document.getElementById('perplexity').innerText = `Perplexity: ${perplexity.toFixed(2)}`;
}