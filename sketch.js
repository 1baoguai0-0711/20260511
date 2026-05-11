let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 檢查 ml5 程式庫是否成功載入
  if (window.ml5 !== undefined) {
    // 初始化 FaceMesh (ml5 v1 標準寫法)
    faceMesh = ml5.faceMesh(options, () => {
      console.log("Model Loaded!");
      // 開始持續偵測
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

  // 影像辨識耳垂並繪製黃色圓圈
  // 確保偵測到臉部，且影片寬高已正常讀取（避免 map 產生 NaN），且影片已就緒
  if (faces.length > 0 && capture.width > 0 && capture.elt.readyState >= 2) {
    let face = faces[0];
    
    // 取得耳垂關鍵點 (176 左, 400 右)
    // 註：在鏡像模式下，偵測到的 leftPt 會對應到畫面上的右側，這是正確的
    let leftPt = face.keypoints[176]; 
    let rightPt = face.keypoints[400];

    fill(255, 255, 0); // 黃色
    stroke(0); // 增加黑色邊框讓它更明顯
    strokeWeight(1);

    if (leftPt) {
      // 將偵測點座標從原始影片尺寸映射到畫布中置中且縮放後的影像區域
      let lx = map(leftPt.x, 0, capture.width, -w / 2, w / 2);
      let ly = map(leftPt.y, 0, capture.height, -h / 2, h / 2);
      circle(lx, ly, 20); // 在左耳垂畫出圓圈
    }
    if (rightPt) {
      // 同樣處理右耳垂的座標映射
      let rx = map(rightPt.x, 0, capture.width, -w / 2, w / 2);
      let ry = map(rightPt.y, 0, capture.height, -h / 2, h / 2);
      circle(rx, ry, 20); // 在右耳垂畫出圓圈
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
