let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };
let earringImage; // 宣告圖片變數

/**
 * preload() 函數會在 setup() 之前執行，用於載入媒體檔案。
 */
function preload() {
  earringImage = loadImage('pic/acc1_ring.png'); // 載入耳環圖片
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

    // 設定耳環寬度 (影像寬度的 10%)
    let imgW = w * 0.10;
    // 根據圖片原始比例計算高度，避免變形
    let imgH = imgW * (earringImage.height / earringImage.width);

    // 設定中心對齊，讓耳環中心掛在點上
    imageMode(CENTER);

    if (leftPt) {
      let lx = map(leftPt.x, 0, capture.width, -w / 2, w / 2);
      let ly = map(leftPt.y, 0, capture.height, -h / 2, h / 2);
      
      // 繪製黃色圓圈
      fill(255, 255, 0);
      noStroke();
      circle(lx, ly, 10);
      
      // 繪製耳環圖片：將圖片向下移動高度的一半，
      // 這樣圖片的頂部（金球處）就會剛好對準耳垂點
      image(earringImage, lx, ly + imgH / 2, imgW, imgH);
    }
    if (rightPt) {
      let rx = map(rightPt.x, 0, capture.width, -w / 2, w / 2);
      let ry = map(rightPt.y, 0, capture.height, -h / 2, h / 2);

      fill(255, 255, 0);
      circle(rx, ry, 10);

      image(earringImage, rx, ry + imgH / 2, imgW, imgH);
    }
    // 恢復預設 imageMode 避免影響其他繪圖
    imageMode(CORNER);
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
