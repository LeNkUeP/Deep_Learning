const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('node:fs');
const path = require('path');

// Daten einlesen und bereinigen
const data = fs.readFileSync(path.resolve(__dirname, 'emails.txt'), 'utf-8');
console.log("read data");
// only half of the data

//const corpus_pre = data.toLowerCase().replace("/(?:\r\n|\r|\n)/g", "aaaabbbbbbpppppooo").replace(/[^a-z\s]/g, '').replace("aaaabbbbbbpppppooo", " ").split(/\s+/);
//const corpus_pre = data.toLowerCase().match(/\b[a-z]+\b/g);
const corpus_pre = data.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
//only half of the data
const corpus = corpus_pre.slice(0, corpus_pre.length / 10);  /// 2000;
console.log("corpus created");
fs.writeFileSync(path.resolve(__dirname, 'corpus.json'), JSON.stringify(corpus));

// Wortindex erstellen
const uniqueWords = Array.from(new Set(corpus));
const wordIndex = {};
uniqueWords.forEach((word, index) => {
  wordIndex[word] = index;
});
//write wordIndex to file
fs.writeFileSync(path.resolve(__dirname, 'wordIndex.json'), JSON.stringify(wordIndex));
console.log("wordIndex created");

const SEQUENCE_LENGTH = 5;
const sequences = [];
const nextWords = [];

// Sequenzen und Zielwörter erstellen
for (let i = 0; i < corpus.length - SEQUENCE_LENGTH; i++) {
  sequences.push(corpus.slice(i, i + SEQUENCE_LENGTH).map(word => wordIndex[word]));
  nextWords.push(wordIndex[corpus[i + SEQUENCE_LENGTH]]);
}
console.log("sequences and nextWords created");

// Tensoren erstellen
const X = tf.tensor2d(sequences, [sequences.length, SEQUENCE_LENGTH]);
const y = tf.oneHot(tf.tensor1d(nextWords, 'int32'), uniqueWords.length);
console.log("tensors created");

// Modell definieren
const model = tf.sequential();
model.add(tf.layers.lstm({
  units: 100,
  returnSequences: true,
  inputShape: [SEQUENCE_LENGTH, 1]
}));
model.add(tf.layers.lstm({
  units: 100
}));
model.add(tf.layers.dense({
  units: uniqueWords.length,
  activation: 'softmax'
}));

// Modell kompilieren
model.compile({
  optimizer: tf.train.adam(0.01),
  loss: 'categoricalCrossentropy'
});

// Daten in das passende Format bringen
const X_reshaped = X.reshape([X.shape[0], SEQUENCE_LENGTH, 1]);

// Modell trainieren
const saveModelCallback = {
  onEpochEnd: async (epoch, logs) => {
    const savePath = `file://./model-epoch-${epoch + 1}`;
    model.save(savePath);
    console.log(`Model saved to ${savePath}`);
  }
};

// Modell trainieren
async function trainModel() {
  console.log('Training model...');

  await model.fit(X_reshaped, y, {
    epochs: 50,
    batchSize: 32,
    callbacks: [
      saveModelCallback
    ]
  });

  console.log('Model training complete.');
}


console.log('Training model...');
trainModel().catch(console.error);