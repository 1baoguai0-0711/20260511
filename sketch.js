let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 檢查 ml5 程式庫是否成功載入
  if (window.ml5 !== undefined) {
    // 初始化 FaceMesh
    faceMesh = ml5.faceMesh(capture, options, () => {
      console.log("Model Loaded!");
    });
    // 開始持續偵測
    faceMesh.detectStart(capture, gotFaces);
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

  // 繪製耳垂黃色圓圈
  // 確保偵測到臉部，且影片寬高已正常讀取（避免 map 產生 NaN）
  if (faces.length > 0 && capture.width > 0) {
    let face = faces[0];
    // 使用 FaceMesh 索引點：176 與 400 為耳垂區域
    let leftEarlobe = face.keypoints[176];
    let rightEarlobe = face.keypoints[400];

    fill(255, 255, 0); // 黃色
    noStroke();

    if (leftEarlobe) {
      // 將原始影片座標映射到縮放後的繪圖區域
      let lx = map(leftEarlobe.x, 0, capture.width, -w / 2, w / 2);
      let ly = map(leftEarlobe.y, 0, capture.height, -h / 2, h / 2);
      circle(lx, ly, 15);
    }
    if (rightEarlobe) {
      // 同樣處理右耳垂
      let rx = map(rightEarlobe.x, 0, capture.width, -w / 2, w / 2);
      let ry = map(rightEarlobe.y, 0, capture.height, -h / 2, h / 2);
      circle(rx, ry, 15);
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
