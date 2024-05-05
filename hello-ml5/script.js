const images = document.querySelectorAll('.column img');
const diagrams = document.querySelectorAll('.diagram img');
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const dropArea = document.getElementById("drop-area");
const loader = document.getElementById("loader")
const classfiyButton = document.getElementById("classifyButton")
const chart = document.getElementById("chartArea")

// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let classifier;

// A variable to hold the image we want to classify
let initImg;
let img;

let initialClassify = true;

inputFile.addEventListener("change", uploadImage);

function preload() {
    classifier = ml5.imageClassifier('MobileNet');
}

function setup() {
    initImg = loadImage("images/arrow.png");
    classifier.classify(initImg, gotResult);
}

images.forEach(function(image) {
    image.addEventListener('mouseover', function() {
        images.forEach(function(otherImage) {
            otherImage.style.opacity = '0.2'; // Setze die Opacity auf 0.2 für andere Bilder
        });
        image.style.opacity = '1'; // Setze die Opacity auf 1 für das gehoverten Bild
        diagrams.forEach(function(otherDiagram) {
            otherDiagram.style.opacity = '1';
        });
    });

    image.addEventListener('mouseout', function() {
        images.forEach(function(otherImage) {
            otherImage.style.opacity = '1'; // Setze die Opacity zurück
        });
        diagrams.forEach(function(otherDiagram) {
            otherDiagram.style.opacity = '0'; // Setze die Opacity auf 0.2 für andere Bilder
        });
    });
});

dropArea.addEventListener("dragover", function(e){
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e){
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

// classify result
function gotResult(error, results) {

    // initial classify
    if(initialClassify){
        enableClassifyButton();
        initialClassify = false;
        return;
    }

    if (error) {
      console.error(error);
    } else {
      console.log(results);
      showDiagram(results);
    }
  }

// drag and drop or 
function uploadImage(){
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    img = loadImage(imgLink);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = "";
    imageView.style.border = 0;
}

function classifyCustomImage(){
    if(img != null){
        classifier.classify(img, gotResult);
    }
}

function enableClassifyButton(){
    loader.style.display = "none";
    classfiyButton.innerText = "Classify";
    classfiyButton.removeAttribute("disabled");
}

let xValues;
let yValues; 
let resultChart;
const barColors = [
    "rgba(121, 121, 121,1)",
    "rgba(121, 121, 121,0.6)",
    "rgba(121, 121, 121,0.2)",
  ];

  resultChart = new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {display: false},
      title: {
        display: true,
        text: "Classification Result"
      }
    }
  });

function showDiagram(results){
    resultChart.destroy();

    xValues = [results[0].label, results[1].label, results[2].label]
    yValues = [results[0].confidence, results[1].confidence, results[2].confidence]

    resultChart = new Chart("myChart", {
        type: "bar",
        data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues
        }]
        },
        options: {
        legend: {display: false},
        title: {
            display: true,
            text: "Classification Result"
        }
        }
    });

      if(chart.style.display="none"){
        chart.style.display = "block";
      }else{
        chart.style.display = "block";
      }
}

function removeAllData(){
    //resultChart.removeAllData();
}

function animateResultChart(){

}
