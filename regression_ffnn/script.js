function yFunction(x) {
  return 0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;
}

// Function to generate data
function generateData(numDataPoints, noiseVariance, xMin, xMax) {
  const xValues = Array.from({ length: numDataPoints }, () => Math.random() * (xMax - xMin) + xMin);
  
  const yValues = xValues.map(x => yFunction(x));

  const indices = Array.from({ length: numDataPoints }, (_, i) => i);
  const shuffledIndices = indices.sort(() => Math.random() - 0.5);
  const trainIndices = shuffledIndices.slice(0, numDataPoints / 2);
  const testIndices = shuffledIndices.slice(numDataPoints / 2);

  const trainData = trainIndices.map(i => ({ x: xValues[i], y: yValues[i] }));
  const testData = testIndices.map(i => ({ x: xValues[i], y: yValues[i] }));

  const noise = () => Math.sqrt(noiseVariance) * (tf.randomNormal([1]).arraySync())[0];

  const trainDataNoisy = trainData.map(({ x, y }) => ({ x, y: y + noise() }));
  const testDataNoisy = testData.map(({ x, y }) => ({ x, y: y + noise() }));

  return { trainData, testData, trainDataNoisy, testDataNoisy };
}

// Function to create a modelbvf
function createModel(numHiddenLayers, neuronsPerLayer, learningRate) {
  const model = tf.sequential();
  for (let i = 0; i < numHiddenLayers; i++) {
    model.add(tf.layers.dense({ units: neuronsPerLayer, activation: 'relu', inputShape: i === 0 ? [1] : undefined }));
  }
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: tf.train.adam(learningRate), loss: 'meanSquaredError' });
  return model;
}

// Function to train the model
async function trainModel(model, xTrain, yTrain, numEpochs, batchSize) {
  const xs = tf.tensor2d(xTrain, [xTrain.length, 1]);
  const ys = tf.tensor2d(yTrain, [yTrain.length, 1]);
  return model.fit(xs, ys, { epochs: numEpochs, batchSize });
}

// Function to evaluate the model
function evaluateModel(model, xTest, yTest) {
  const xs = tf.tensor2d(xTest, [xTest.length, 1]);
  const ys = tf.tensor2d(yTest, [yTest.length, 1]);
  const evalOutput = model.evaluate(xs, ys);
  return evalOutput.arraySync();
}

// Function to predict using the model
function predictModel(model, xValues) {
  const xs = tf.tensor2d(xValues, [xValues.length, 1]);
  const preds = model.predict(xs);
  return preds.arraySync();
}

async function createMultipleDataChart(train, test, chartName) {
  new Chart(chartName, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Train Data',
        data: train,
        backgroundColor: 'rgba(54, 162, 235, 1)'
      }, {
        label: 'Test Data',
        data: test,
        backgroundColor: 'rgba(255, 99, 132, 1)'
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'x'
          }
        },
        y: {
          title: {
            display: true,
            text: 'y'
          }
        }
      }
    }
  });
}

async function createSingleDataChart(data, isTrainData, chartName) {
  let col;
  let label;
  if(isTrainData){
    col = 'rgba(54, 162, 235, 1)';
    label = 'Train Data';
  }else{
    col = 'rgba(255, 99, 132, 1)';
    label = 'Test Data';
  }

  new Chart(chartName, {
    type: 'scatter',
    data: {
      datasets: [{
        label: label,
        data: data,
        backgroundColor: col
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'x'
          }
        },
        y: {
          title: {
            display: true,
            text: 'y'
          }
        }
      }
    }
  });
}


// ******************
// ******MAIN********
// ******************

const hiddenLayer = 2;
const neurons = 100;
const dataPoints = 100;
const epochs = 100;
const learningRate = 0.01;
const batchSize = 32;
const noiseVariance = 0.05;
const minX = -2;
const maxX = 2;

const { trainData, testData, trainDataNoisy, testDataNoisy } = generateData(dataPoints, noiseVariance, minX, maxX);

const xTrainDataNotNoisy = trainData.map(d => d.x);
const yTrainDataNotNoisy = trainData.map(d => d.y);
const xTestDataNotNoisy = testData.map(d => d.x);
const yTestDataNotNoisy = testData.map(d => d.y);

const xTrainDataNoisy = trainDataNoisy.map(d => d.x);
const yTrainDataNoisy = trainDataNoisy.map(d => d.y);
const xTestDataNoisy = testDataNoisy.map(d => d.x);
const yTestDataNoisy = testDataNoisy.map(d => d.y);

// show data
createMultipleDataChart(trainData, testData, "scatter-plot1");
createMultipleDataChart(trainDataNoisy, testDataNoisy, "scatter-plot2");

// not noisy
const modelNotNoisy = createModel(hiddenLayer, neurons, learningRate);
await trainModel(modelNotNoisy, xTrainDataNotNoisy, yTrainDataNotNoisy, epochs, batchSize);

const yPredictionNotNoisyTrain = predictModel(modelNotNoisy, xTrainDataNotNoisy);
const predictionNotNoisyTrain = yPredictionNotNoisyTrain.map((y, i) => ({x: xTrainDataNotNoisy[i], y: y[0]}));
const yPredictionNotNoisyTest = predictModel(modelNotNoisy, xTestDataNotNoisy);
const predictionNotNoisyTest = yPredictionNotNoisyTest.map((y, i) => ({x: xTestDataNotNoisy[i], y: y[0]}));

createSingleDataChart(predictionNotNoisyTrain, true, "scatter-plot3");
createSingleDataChart(predictionNotNoisyTest, false, "scatter-plot4");

document.getElementById('trainLoss3').innerText = "Train Loss = " + evaluateModel(modelNotNoisy, xTrainDataNotNoisy, yTrainDataNotNoisy);
document.getElementById('testLoss4').innerText = "Test Loss = " + evaluateModel(modelNotNoisy, xTestDataNotNoisy, yTestDataNotNoisy);



// best fit noisy
const bestFitModel = createModel(hiddenLayer, neurons, learningRate);
await trainModel(bestFitModel, xTrainDataNoisy, yTrainDataNoisy, 300, batchSize);

const yBestFitPredictionNoisyTrain = predictModel(bestFitModel, xTrainDataNoisy);
const bestFitPredictionNoisyTrain = yBestFitPredictionNoisyTrain.map((y, i) => ({x: xTrainDataNoisy[i], y: y[0]}));
const yBestFitPredictionNoisyTest = predictModel(bestFitModel, xTestDataNoisy);
const bestFitPredictionNoisyTest = yBestFitPredictionNoisyTest.map((y, i) => ({x: xTestDataNoisy[i], y: y[0]}));

createSingleDataChart(bestFitPredictionNoisyTrain, true, "scatter-plot5");
createSingleDataChart(bestFitPredictionNoisyTest, false, "scatter-plot6");

document.getElementById('trainLoss5').innerText = "Train Loss = " + evaluateModel(bestFitModel, xTrainDataNoisy, yTrainDataNoisy);
document.getElementById('testLoss6').innerText = "Test Loss = " + evaluateModel(bestFitModel, xTestDataNoisy, yTestDataNoisy);



// overfit noisy
const overfitModel = createModel(hiddenLayer, neurons, learningRate);
await trainModel(overfitModel, xTrainDataNoisy, yTrainDataNoisy, 100, batchSize);

const yOverFitPredictionNoisyTrain = predictModel(overfitModel, xTrainDataNoisy);
const overFitPredictionNoisyTrain = yOverFitPredictionNoisyTrain.map((y, i) => ({x: xTrainDataNoisy[i], y: y[0]}));
const yOverFitPredictionNoisyTest = predictModel(overfitModel, xTestDataNoisy);
const overFitPredictionNoisyTest = yOverFitPredictionNoisyTest.map((y, i) => ({x: xTestDataNoisy[i], y: y[0]}));

createSingleDataChart(overFitPredictionNoisyTrain, true, "scatter-plot7");
createSingleDataChart(overFitPredictionNoisyTest, false, "scatter-plot8");

document.getElementById('trainLoss7').innerText = "Train Loss = " + evaluateModel(overfitModel, xTrainDataNoisy, yTrainDataNoisy);
document.getElementById('testLoss8').innerText = "Test Loss = " + evaluateModel(overfitModel, xTestDataNoisy, yTestDataNoisy);

