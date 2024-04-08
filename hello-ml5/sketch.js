// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let classifier;

// A variable to hold the image we want to classify
let img;

const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");

const classification = document.getElementById("classification");
const probability = document.getElementById("probability");

inputFile.addEventListener("change", uploadImage);

function preload() {
  classifier = ml5.imageClassifier('MobileNet');
  //img = loadImage('images/cat.jpg');
}

function setup() {
  //createCanvas(img.width, img.height);
  //classifier.classify(img, gotResult);
  //image(img, 0, 0);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  } else {
    // The results are in an array ordered by confidence.
    console.log(results);
    classification.innerText = `Label: ${results[0].label}`
    probability.innerText = `Confidence: ${nf(results[0].confidence, 0, 2)}`
    //createDiv(`Label: ${results[0].label}`);
    //createDiv(`Confidence: ${nf(results[0].confidence, 0, 2)}`);
  }
}

function uploadImage(){
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    img = loadImage(imgLink);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = "";
    imageView.style.border = 0;
    classifier.classify(img, gotResult);
}

dropArea.addEventListener("dragover", function(e){
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e){
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});