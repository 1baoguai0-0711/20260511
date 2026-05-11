let capture;
let faceMesh;
let handpose;
let faces = [];
let hands = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };
let accessoryImages = {};
let selectedAccessory = null;

function preload() {
  accessoryImages[1] = loadImage('pic/acc1_ring.png');
  accessoryImages[2] = loadImage('pic/acc2_pearl.png');
  accessoryImages[3] = loadImage('pic/acc3_tassel.png');
  accessoryImages[4] = loadImage('pic/acc4_jade.png');
  accessoryImages[5] = loadImage('pic/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 檢查 ml5 是否載入並初始化
  if (window.ml5 !== undefined) {
    // FaceMesh 模型
    faceMesh = ml5.faceMesh(options, () => {
      console.log("FaceMesh Loaded!");
      faceMesh.detectStart(capture, gotFaces);
    });

    // Handpose 模型（若可用才載入）
    if (ml5.handpose !== undefined) {
      handpose = ml5.handpose(capture, () => {
        console.log("Handpose Loaded!");
      });
      handpose.on('predict', gotHands);
    } else {
      console.warn("ml5 handpose model not available. Hand gesture detection disabled.");
    }
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

    // 根據手勢決定要顯示哪個耳環，預設為 acc1_ring
    selectedAccessory = accessoryImages[1];
    if (hands.length > 0) {
      let gestureCount = countExtendedFingers(hands[0]);
      if (gestureCount >= 1 && gestureCount <= 5) {
        selectedAccessory = accessoryImages[gestureCount];
      }
    }

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

      if (selectedAccessory) {
        imageMode(CENTER);
        let imgW = w * 0.12;
        let imgH = imgW * (selectedAccessory.height / selectedAccessory.width);
        image(selectedAccessory, lx, ly, imgW, imgH);
      }
    }
    if (rightPt) {
      let rx = map(rightPt.x, 0, capture.width, -w / 2, w / 2);
      let ry = map(rightPt.y, 0, capture.height, -h / 2, h / 2);

      noFill();
      stroke(255, 255, 0);
      strokeWeight(4);
      circle(rx, ry, 28);

      if (selectedAccessory) {
        imageMode(CENTER);
        let imgW = w * 0.12;
        let imgH = imgW * (selectedAccessory.height / selectedAccessory.width);
        image(selectedAccessory, rx, ry, imgW, imgH);
      }
    }
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

function gotHands(results) {
  hands = results;
}

function countExtendedFingers(hand) {
  if (!hand || !hand.landmarks) return 0;
  let lm = hand.landmarks;
  let extended = 0;

  // 依照手指伸展程度判斷：如果指尖高於 PIP 關節，視為伸直
  let fingerTips = [8, 12, 16, 20];
  let fingerPIPs = [6, 10, 14, 18];
  for (let i = 0; i < fingerTips.length; i++) {
    let tip = lm[fingerTips[i]];
    let pip = lm[fingerPIPs[i]];
    if (tip[1] < pip[1] - 8) {
      extended++;
    }
  }

  // 判斷大拇指是否伸直：大拇指指尖與腕部距離比 IP 關節與腕部距離還大
  let wrist = lm[0];
  let thumbTip = lm[4];
  let thumbIp = lm[3];
  let distTip = dist(thumbTip[0], thumbTip[1], wrist[0], wrist[1]);
  let distIp = dist(thumbIp[0], thumbIp[1], wrist[0], wrist[1]);
  if (distTip > distIp * 1.1) {
    extended++;
  }

  return extended;
}
