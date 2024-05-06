const images = document.querySelectorAll('.column img');
const diagrams = document.querySelectorAll('.diagram img');
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const dropArea = document.getElementById("drop-area");
const loader = document.getElementById("loader")
const classfiyButton = document.getElementById("classifyButton")
const chart = document.getElementById("chartArea")
const exampleChart = document.getElementById("exampleChart")
const right = document.getElementById("right")
const wrong = document.getElementById("wrong")

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
  if(image.id !=wrong.id && image.id !=right.id){
    image.addEventListener('mouseover', function() {
      images.forEach(function(otherImage) {
          otherImage.style.opacity = '0.2'; // Setze die Opacity auf 0.2 für andere Bilder
      });
      image.style.opacity = '1'; // Setze die Opacity auf 1 für das gehoverten Bild
      diagrams.forEach(function(otherDiagram) {
          otherDiagram.style.opacity = '1';
      });
      if(image.id == "Image1" || image.id == "Image2" || image.id == "Image3"){
        right.style.opacity = '1';
      }else{
        wrong.style.opacity = '1';
      }

      diagrams[0].src=image.src;
      if(!initialClassify){
        classifier.classify(image, gotResultForExampleDiagram);
      }
  });

  image.addEventListener('mouseout', function() {
    if(image.id !=wrong.id && image.id !=right.id){
      images.forEach(function(otherImage) {
        otherImage.style.opacity = '1'; // Setze die Opacity zurück
      });
      diagrams.forEach(function(otherDiagram) {
          otherDiagram.style.opacity = '0'; // Setze die Opacity auf 0.2 für andere Bilder
      });
      removeExampleDiagram();
    }
  });
  }
});

dropArea.addEventListener("dragover", function(e){
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e){
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

function gotResultForExampleDiagram(error, results) {
  if (error) {
    console.error(error);
  } else {
    console.log(results);
    showExampleDiagram(results);
  }
}

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
let exampleResultChart;
const barColors = [
    "rgba(121, 121, 121,1)",
    "rgba(121, 121, 121,0.6)",
    "rgba(121, 121, 121,0.2)",
  ];


function showDiagram(results){
    if (resultChart) resultChart.destroy();

    xValues = [results[0].label,results[1].label,results[2].label];
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
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function(value, index, values) {
                      return value.split(",");
                    }
                }
            }]
        }
        }
    });

    if(chart.style.display="none"){
      chart.style.display = "block";
    }
}

function showExampleDiagram(results){
  if (exampleResultChart) exampleResultChart.destroy();

  xValues = [results[0].label,results[1].label,results[2].label];
  yValues = [results[0].confidence, results[1].confidence, results[2].confidence]

  exampleResultChart = new Chart("exampleChart", {
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
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
              ticks: {
                  maxRotation: 0,
                  minRotation: 0,
                  callback: function(value, index, values) {
                    // Split the labels to show them on multiple lines
                    return value.split(",");
                  }
              }
          }]
      }
      }
  });

  if(exampleChart.style.display="none"){
    exampleChart.style.display = "block";
  }
}

function removeExampleDiagram(){
  if (exampleResultChart) exampleResultChart.destroy();
}

function removeAllData(){
    //resultChart.removeAllData();
}

function animateResultChart(){

}
