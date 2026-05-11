let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };
let earringImage;

function preload() {
  earringImage = loadImage('pic/acc1_ring.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 檢查 ml5 是否載入並初始化
  if (window.ml5 !== undefined) {
    // ml5 v1 標準初始化：先載入模型，再開始偵測
    faceMesh = ml5.faceMesh(options, () => {
      console.log("Model Loaded!");
      faceMesh.detectStart(capture, gotFaces);
    });
  } else {
    console.error("ml5.js library not found! Please include it in your HTML.");
  }
}

function draw() {
  background('#e7c6ff');

  let w = width * 0.5;
  let h = height * 0.5;

  push();
  // 將座標原點移至畫面中心，方便縮放與定位
  translate(width / 2, height / 2);
  // 水平翻轉影像 (左右顛倒)
  scale(-1, 1);
  // 在中心位置繪製影像，寬高為全螢幕的 50%
  image(capture, -w / 2, -h / 2, w, h);

  // 影像辨識耳垂
  // 確保 capture.width 已準備好，避免 map 出現 NaN
  if (faces.length > 0 && capture.width > 0 && capture.elt.readyState >= 2) {
    let face = faces[0];

    // MediaPipe FaceMesh 標準耳垂索引：176 (左), 400 (右)
    let leftPt = face.keypoints[176];
    let rightPt = face.keypoints[400];

    if (leftPt) {
      let lx = map(leftPt.x, 0, capture.width, -w / 2, w / 2);
      let ly = map(leftPt.y, 0, capture.height, -h / 2, h / 2);

      // 繪製黃色圓圈於左耳垂
      noFill();
      stroke(255, 255, 0);
      strokeWeight(4);
      circle(lx, ly, 28);

      // 繪製耳環圖案
      if (earringImage) {
        imageMode(CENTER);
        let imgW = w * 0.12;
        let imgH = imgW * (earringImage.height / earringImage.width);
        image(earringImage, lx, ly, imgW, imgH);
        imageMode(CORNER);
      }

      // 顯示文字標記
      noStroke();
      fill(255, 255, 0);
      textSize(16);
      textAlign(CENTER, BOTTOM);
      text('左耳垂', lx, ly - 18);
    }
    if (rightPt) {
      let rx = map(rightPt.x, 0, capture.width, -w / 2, w / 2);
      let ry = map(rightPt.y, 0, capture.height, -h / 2, h / 2);

      noFill();
      stroke(255, 255, 0);
      strokeWeight(4);
      circle(rx, ry, 28);

      if (earringImage) {
        imageMode(CENTER);
        let imgW = w * 0.12;
        let imgH = imgW * (earringImage.height / earringImage.width);
        image(earringImage, rx, ry, imgW, imgH);
        imageMode(CORNER);
      }

      noStroke();
      fill(255, 255, 0);
      textSize(16);
      textAlign(CENTER, BOTTOM);
      text('右耳垂', rx, ry - 18);
    }
  }
  pop();
}

function windowResized() {
  // 當視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}
