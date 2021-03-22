// 阈值 0 - 255
const d = 5;
// 判断是否非空白像素
function notEmpty(type, r, g, b, a) {
  // 透明
  if (type === 'transparent') {
    return a > 0;
  }
  // 白色
  return r < 255 - d && g < 255 - d && b < 255 - d;
}

// 裁剪四周的透明/白色区域
export default function getCutPosition(width, height, imgData, type = 'transparent') {
  let lOffset = width; let rOffset = 0; let tOffset = height; let bOffset = 0;
  // 获取最小的非空白区域
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const pos = (i + width * j) * 4;
      // if (isEmpty(imgData[pos]) || isEmpty(imgData[pos + 1]) || isEmpty(imgData[pos + 2]) || isEmpty(imgData[pos + 3])) {
      if (notEmpty(type, imgData[pos], imgData[pos + 1], imgData[pos + 2], imgData[pos + 3])) {
        bOffset = Math.max(j, bOffset); // 找到有色彩的最下端
        rOffset = Math.max(i, rOffset); // 找到有色彩的最右端
        tOffset = Math.min(j, tOffset); // 找到有色彩的最上端
        lOffset = Math.min(i, lOffset); // 找到有色彩的最左端
      }
    }
  }

  // 向右下角扩展 1px
  rOffset++;
  bOffset++;

  // 如果形状不是正方形，将其扩展为正方形
  const r = (rOffset - lOffset) / (bOffset - tOffset);
  if (r > 1) {
    const halfOffset = ((rOffset - lOffset) - (bOffset - tOffset)) / 2;
    // ceil，遇到 0.5px 就会向下方向移动取整
    tOffset = Math.ceil(tOffset - halfOffset);
    bOffset = Math.ceil(bOffset + halfOffset);
  }
  if (r < 1) {
    // ceil，遇到 0.5px 就会向右方向移动取整
    const halfOffset = ((bOffset - tOffset) - (rOffset - lOffset)) / 2;
    lOffset = Math.ceil(lOffset - halfOffset);
    rOffset = Math.ceil(rOffset + halfOffset);
  }

  return {
    x: lOffset,
    y: tOffset,
    width: rOffset - lOffset,
    height: bOffset - tOffset,
  };
}
