import React, { useRef, useEffect, useState } from 'react';
import { Icon, Button } from '@alicloudfe/components';
import '@alicloudfe/components/dist/yunxiao.css';
import getCutPosition from '@/common/cut';
import { labels, labelMap } from '@/common/labels';

const fontStep = 1;
const fontSize = [20, 96];
const canvasSize = 96;
const cutSize = 96;

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvasSize;
offscreenCanvas.height = canvasSize;
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCtx.textBaseline = 'top';

const offscreenCanvas2 = document.createElement('canvas');
offscreenCanvas2.width = cutSize;
offscreenCanvas2.height = cutSize;
const offscreenCtx2 = offscreenCanvas2.getContext('2d');

const Dashboard = () => {
  const canvas = useRef();
  const ctxRef = useRef();
  const [raws, setRaws] = useState([]);
  const [cuts, setCuts] = useState([]);
  // const [full, setFull] = useState([]);
  useEffect(() => {
    const ctx = canvas.current && canvas.current.getContext('2d');
    ctx.textBaseline = 'top';
    ctxRef.current = ctx;
  }, []);

  function handleClick(type) {
    const ctx = ctxRef.current;

    // 预览 icon
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    ctx.font = `${canvasSize}px NextIcon`;
    ctx.fillText(labelMap[type], 0, 0);

    // 生成图片
    const { raw: rawList, cut: cutList } = createImgs(type);
    setRaws(rawList);
    setCuts(cutList);
  }

  function createImgs(type, offsetX = 0, offsetY = 0) {
    const rawList = [];
    const cutList = [];
    for (let i = fontSize[0]; i <= fontSize[1]; i += fontStep) {
      offscreenCtx.clearRect(0, 0, canvasSize, canvasSize);
      offscreenCtx.fillStyle = '#fff';
      offscreenCtx.fillRect(0, 0, canvasSize, canvasSize);
      offscreenCtx.fillStyle = '#000';
      offscreenCtx.font = `${i}px NextIcon`;
      offscreenCtx.fillText(labelMap[type], offsetX, offsetY);
      rawList.push(offscreenCanvas.toDataURL('image/jpeg'));

      const { x, y, width: w, height: h } = getCutPosition(canvasSize, canvasSize, offscreenCtx.getImageData(0, 0, canvasSize, canvasSize).data, 'white');
      offscreenCtx2.clearRect(0, 0, cutSize, cutSize);
      offscreenCtx2.fillStyle = '#fff';
      offscreenCtx2.fillRect(0, 0, cutSize, cutSize);
      offscreenCtx2.fillStyle = '#000';
      offscreenCtx2.drawImage(offscreenCanvas, x, y, w, h, 0, 0, cutSize, cutSize);
      cutList.push(offscreenCanvas2.toDataURL('image/jpeg'));
    }

    return { raw: rawList, cut: cutList };
  }

  function handleDownload() {
    const resultData = labels.map((type, index) => {
      const { cut: cutList } = createImgs(type);
      console.log(`生成图片 ${index}/${labels.length}`);
      return {
        name: type,
        data: cutList.map((base64, i) => {
          return {
            url: base64,
            size: fontSize[0] + i * fontStep,
          };
        }),
      };
    });

    const aLink = document.createElement('a');
    const blob = new Blob([JSON.stringify(resultData, null, 2)], {type : 'application/json'});
    aLink.download = 'icon.json';
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
  }

  return (
    <div>
      <p>全部 icon 预览，点击选择单个图标预览裁剪效果：</p>
      <div>
        <ul className="icon-list">
          {labels.map((type) => (
            <li
              key={type}
              onClick={() => handleClick(type)}
              style={{ display: 'inline-block', width: 80, height: 80, textAlign: 'center' }}
            >
              <Icon type={type} size="xxxl" />
              <div>{type}</div>
            </li>
          ))}
        </ul>
      </div>
      <p>当前选中 icon 预览：</p>
      <canvas style={{ border: '1px solid #ccc' }} ref={canvas} width={canvasSize} height={canvasSize} />
      <p>原始生成图片：</p>
      {
        raws.map((img, i) => {
          return <img key={i} src={img} alt="" />;
        })
      }
      <p>裁剪后图片：</p>
      {
        cuts.map((img, i) => {
          return <img key={i} src={img} alt="" />;
        })
      }
      <hr />
      <Button onClick={handleDownload}>下载数据</Button>
      <hr />
    </div>
  );
};

export default Dashboard;
