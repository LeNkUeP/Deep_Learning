document.addEventListener("DOMContentLoaded", function() {
    
    // Placeholder für die zukünftige Funktionalität der Buttons und Wortvorhersage
    document.getElementById('vorhersage').onclick = function() {
        alert('Vorhersage Button geklickt');
    };
    document.getElementById('weiter').onclick = function() {
        alert('Weiter Button geklickt');
    };
    document.getElementById('auto').onclick = function() {
        alert('Auto Button geklickt');
    };
    document.getElementById('stopp').onclick = function() {
        alert('Stopp Button geklickt');
    };
    document.getElementById('reset').onclick = function() {
        document.getElementById('prompt').value = '';
        document.getElementById('prediction-options').innerHTML = '';
    };

    // Funktion zum Einlesen der CSV-Datei
    async function loadCSV(filePath) {
        return new Promise((resolve, reject) => {
            Papa.parse(filePath, {
                download: true,
                header: true,
                complete: function(results) {
                    resolve(results.data);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    }

    // Funktion zum Laden des gespeicherten Modells
    async function loadModel(modelPath) {
        try {
            const model = await tf.loadLayersModel(modelPath);
            console.log('Modell geladen:', modelPath);
            return model;
        } catch (error) {
            console.error('Fehler beim Laden des Modells:', error);
            throw error;
        }
    }

    // Einfacher Tokenizer
    function simpleTokenizer(text) {
        return text.toLowerCase()
                .replace(/[^a-zäöüß\s]/gi, '') // Umlaute und ß hinzufügen
                .split(/\s+/);
    }

    // Textdaten bereinigen und vorbereiten
    function prepareData(data) {
        const allText = data.map(item => item.text).join(' ');
        const tokens = simpleTokenizer(allText);

        // Erstellen Sie eine Wort-Index-Zuordnung
        const wordIndex = {};
        tokens.forEach(word => {
            if (!wordIndex[word]) {
                wordIndex[word] = Object.keys(wordIndex).length + 1;
            }
        });

        // Erstellen Sie Sequenzen
        const sequences = [];
        const sequenceLength = 5;
        for (let i = 0; i <= tokens.length - sequenceLength; i++) {
            const seq = tokens.slice(i, i + sequenceLength).map(word => wordIndex[word]);
            sequences.push(seq);
        }

        // Padding der Sequenzen
        const paddedSequences = sequences.map(seq => {
            while (seq.length < sequenceLength) {
                seq.push(0); // Padding mit Nullen
            }
            return seq;
        });

        return { sequences: paddedSequences, wordIndex };
    }

    // LSTM-Modell erstellen und trainieren
    async function trainModel(sequences, wordIndex) {
        const vocabSize = Object.keys(wordIndex).length + 1;

        // Modell definieren
        const model = tf.sequential();
        model.add(tf.layers.lstm({
            units: 100,
            returnSequences: true,
            inputShape: [sequences[0].length, 1]
        }));
        model.add(tf.layers.lstm({
            units: 100
        }));
        model.add(tf.layers.dense({
            units: vocabSize,
            activation: 'softmax'
        }));

        // Modell kompilieren
        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'categoricalCrossentropy'
        });

        const xs = tf.tensor2d(sequences.map(seq => seq.slice(0, -1)));
        const ys = tf.tensor1d(sequences.map(seq => seq[seq.length - 1]), 'int32');

        await model.fit(xs, ys, { epochs: 50, batchSize: 32 });

        return model;
    }

    // Vorhersagefunktion
    function predictNextWord(model, seedText, wordIndex) {
        const tokens = simpleTokenizer(seedText.toLowerCase());
        const input = tokens.map(word => wordIndex[word] || 0); // Default to 0 if word not in index
        while (input.length < 5) {
            input.push(0); // Padding mit Nullen
        }
        const paddedInput = tf.tensor2d([input]);

        const prediction = model.predict(paddedInput);
        const predictedIndex = prediction.argMax(1).dataSync()[0];

        const indexToWord = Object.keys(wordIndex).reduce((obj, word) => {
            obj[wordIndex[word]] = word;
            return obj;
        }, {});

        return indexToWord[predictedIndex];
    }

    function startModel(data){
        const preparedData = prepareData(data);
        trainModel(preparedData.sequences, preparedData.wordIndex).then(model => {
            console.log('Modell trainiert');
            //const nextWord = predictNextWord(model, 'Ihr Text hier', preparedData.wordIndex);
            //console.log('Vorhergesagtes Wort:', nextWord);
        });
    }

    // Beispielaufruf
    //loadCSV('emails.csv').then(data => {
     //   document.getElementById('auto').onclick = function() {
    //        startModel(data);
    //    };

    //}).catch(err => {
    //    console.error('Error:', err);
    //});

    // Hauptfunktion zum Laden des Modells und zur Vorhersage
    async function main() {
        const modelPath = 'next_word_model.h5'; // Pfad zu Ihrer .h5 Modelldatei
        const seedText = 'Hallo ich bin';

        try {
            const model = await loadModel(modelPath);
            await predictNextWord(model, seedText);
        } catch (error) {
            console.error('Fehler:', error);
        }
    }

    // Ausführung der Hauptfunktion
    //main();

    inputText = "Hallo "

    const requestBody = {
        "text": inputText
      };
  
      fetch('https://nextwordapi.flayinahook.de/predictLennart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }).then(async response => response.json()).then(data => {
        //setPrediction(data.prediction);
        //setPredictions(data.predictions);
        console.log(data)
      }
      ).catch(error => console.error('Error:', error)); 
});
