const path = require('path');
const fs = require('fs');
const iconData = require('./iconData/icon.json');

// 指定目标存放路径
const targetPath = path.resolve(__dirname, './iconData/imgs');

fs.rmdirSync(targetPath, {
  recursive: true,
});
console.log('清空数据');

fs.mkdirSync(path.resolve(__dirname, './iconData/imgs'));

fs.mkdirSync(path.resolve(__dirname, './iconData/imgs/train'));
fs.mkdirSync(path.resolve(__dirname, './iconData/imgs/validation'));
fs.mkdirSync(path.resolve(__dirname, './iconData/imgs/test'));
console.log('创建空文件夹');

// 分桶，训练集、验证集、测试集 的比例
const trainPercent = 0.7;
const validationPercent = 0.2;
const testPercent = 0.1;

const dataLen = iconData[0].data.length;
const testLen = Math.round(dataLen * testPercent);
const validationLen = Math.round(dataLen * validationPercent);
const trainLen = dataLen - testLen - validationLen;

console.log('数据长度：', dataLen, '训练集：', trainLen, '验证集：', validationLen, '测试集：', testLen);

// 将数据随机分到三个数据集中
const trainData = [];
const validationData = [];
const testData = [];
iconData.forEach(icon => {
  const { name, data } = icon;

  const validationD = [];
  const testD = [];
  for(let i = 0; i < testLen; i++) {
    const index = Math.round((data.length - 1) * Math.random());
    testD.push(data.splice(index, 1)[0]);
  }
  for(let i = 0; i < validationLen; i++) {
    const index = Math.round((data.length - 1) * Math.random());
    validationD.push(data.splice(index, 1)[0]);
  }

  validationData.push({
    name,
    data: validationD,
  });
  testData.push({
    name,
    data: testD,
  });
  // 剩下的作为训练集
  trainData.push({
    name,
    data,
  });
});
console.log('拆分数据完毕，开始写入文件');

writeImg(path.join(targetPath, 'train'), trainData);
console.log('写入训练集完成');
writeImg(path.join(targetPath, 'validation'), validationData);
console.log('写入验证集完成');
writeImg(path.join(targetPath, 'test'), testData);
console.log('写入测试集完成');

function writeImg(target, data) {
  data.forEach(icon => {
    const { name, data } = icon;

    fs.mkdirSync(path.join(target, `./${name}`));

    data.forEach(item => {
      const { url, size } = item;

      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      const dataBuffer = Buffer.from(base64Data, 'base64');

      // 写入图片
      fs.writeFileSync(path.join(target, name, `${name}_${size}.jpeg`), dataBuffer);
    });
  });
}



console.log('生成图片完毕');
