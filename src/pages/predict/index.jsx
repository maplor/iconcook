import React, { useEffect, useState } from 'react';
import { Icon } from '@alicloudfe/components';
import * as tf from '@tensorflow/tfjs';
import getCutPosition from '@/common/cut';
import styles from './index.module.scss';

const resultLabels = ["col-before","h1","solidDown","add-test","arrow-up-o-fill","chevron-down-o","degree","task-board","copy","ascending","user","user-fill","user-switch","tick-o-fill","chevron-down","intro","framer","tag-fill","office-word","pin-fill","blockquote","quote","arrow-up-o","user-o","users-fill","office-powerpoint","arrow-roundright","verified","building","arrow-out","oldman","sun","region-fill","bold","team-terminal","question-o-fill","cry","chevron-right-o-fill","chevron-right","to-do","user-externa","share-stroke","salesman","team-talk","team-pen","chevron-up","row-before","picture","crop","briefcase-stroke","fangcloud","table","set","distribute","team-graph","expand-oblique","h3","pause-o","weibo","unlock","calendar-tick","descending","arrow-up1","treenode-single","minus","robot","chat-private-stroke","arrow-right-o-fill","chevrons-expand-horizontal","attachment","evernote","chevron-up-o-fill","users","arrow-upright-o-fill","list","github","minus-o","triangle-left","arrows-pinch-out","tree","save","team-flag","wechat","chevron-down-o-fill","dribbble","normal","custom-number","italic","clear","drag","wechat-enterprise","arrows-cycle","team-stamp","warning-o","sort","progress","earth","knowledge-base","log-out","print","chat-private","org-crown","import","size-grid","filter","org-projects","custom-text","row-after","invite-fill","team-medal","milestone","ip-box-fill","processon","comments","triangle-up","team-tie","task-dependency","enterprise-calendar","arrow-hollow-down","book","risk","team-bulb","linkedin","tick-o","queding","expand","h2","question-o","chevrons-expand-vertical","home","dingding-o-fill","collection","download","multi-number","add-user-set","org-book","switch1","chevron-up-o","user-search","arrow-down1","checkbox","unlink","paragraph","arrows-full-collapse","tex","eye-close","tick-bold","xiaomi","share1","stack-tick","line-through","unordered-list","double-tick","sprint","teambition","single-chat-bubble","task-dependency-post","zhihu","bookkeeping-logo","clock-fill","shortcut","video","arrow-hollow-up","detail","compass-o","upload-pic","office-excel","approve","arrow-in","upload","douban","branch","user-question","twitter","lock","checkbox-checked-fill","like-fill","permission","chat-group-stroke","home-fill","team-briefcase","ip","gitlab","align-center","arrow-left-o-fill","clock","rich-text","more-o","switch","exit","team-loudspeaker","org-apps","like","arrow-clock-left","add","report-overview","histogram","loading","arrow-down-o-fill","contact","triangle-right","alert-clock","single-selection","sorting","redo","code","plus-box-fill","meta","zendesk","pencil-fill","chevron-left-o-fill","scan","grid","box-plus","circle","more-o-fill","collapse","warning-o-fill","play-outline","teambition-outline","bell-fill","markdown","inbox","favorite-fill","pencil","chevrons-left","toggle-right","info","import-project","file","wps","team-bus","top-up-fill","arrow-down-o","region","post","custom-field","plus-o-fill","share-stage","ziyuan","remove","calendar","info-o","column","dashboard","demo","info-o-fill","ashbin","chevron-left-o","figma","star-fill","jinshuju","yunzhijia","mobile","google","chevron-right-o","add-folder","menu","chevron-left","remove-o-fill","download-stage","tongzhi","dingding","org-medal","search","computer","stack-tick-fill","folder","team-calculator","arrow-clock-right","undo","arrow-right1","align-left","qrcode","col-after","panel","intelligent-assistant","user-disable","checkbox-checked","arrows-pinch","building-fill","underline","double-box-plus","export","unfold","multi-selection","tag","chevrons-right","play-o","cuvette","cut","bulb","starstroke","user-add","moon","lightning","headset","plus-o","team-location","netease","dropbox","workhour","multiplechoice","team-camera","aliyun","invistion","rss","email","created-fill","question-talk","pinterest","reorder","qq","safety","link","arrow-left1","arrow-left-o","toggle-left","Aone","align-right","client","triangle-down","pin","paper","created","newtab","dock","task-dependency-pre","zoom-out","stage","compass-fill","priorityflag","more","disable","focus","team-building","zoom-in","arrow-upline-o-fill","eye","smile","overview","discussion-fill","edit","arrow-right-o","heading","palette","arrow-roundleft","favorite","download-file","inbox1","tick","task-tick","triangle-right-o","arrows-full-expand","facebook","target","timeline","chevrons-collapse-vertical","screenshot","remove-o"];

const canvasSize = 224;
const cutSize = 224;

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvasSize;
offscreenCanvas.height = canvasSize;
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCtx.textBaseline = 'top';

const offscreenCanvas2 = document.createElement('canvas');
offscreenCanvas2.width = cutSize;
offscreenCanvas2.height = cutSize;
const offscreenCtx2 = offscreenCanvas2.getContext('2d');

const Predict = () => {
  const [imgUrl, setImgUrl] = useState('');
  const [icons, setIcons] = useState([]);

  const onImgLoad = async (e) => {
    const { naturalWidth: imgW, naturalHeight: imgH } = e.target;
    offscreenCanvas.width = imgW;
    offscreenCanvas.height = imgH;
    offscreenCtx.clearRect(0, 0, imgW, imgH);
    offscreenCtx.fillStyle = '#fff';
    offscreenCtx.fillRect(0, 0, imgW, imgH);
    offscreenCtx.drawImage(e.target, 0, 0);
    const { x, y, width: w, height: h } = getCutPosition(imgW, imgH, offscreenCtx.getImageData(0, 0, imgW, imgH).data, 'white');
    console.log(x, y, w, h);

    offscreenCtx2.clearRect(0, 0, cutSize, cutSize);
    offscreenCtx2.fillStyle = '#fff';
    offscreenCtx2.fillRect(0, 0, cutSize, cutSize);
    offscreenCtx2.drawImage(offscreenCanvas, x, y, w, h, 0, 0, cutSize, cutSize);

    setImgUrl(offscreenCanvas2.toDataURL());

    if (window.iconClassifierModel) {
      const imgTensor = tf.image
        .resizeBilinear(tf.browser.fromPixels(offscreenCanvas2), [224, 224])
        .reshape([1, 224, 224, 3]);
      const pred = window.iconClassifierModel.predict(imgTensor).arraySync()[0];

      const result = pred.map((score, i) => ({ score, label: resultLabels[i] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // const result = await window.iconClassifierModel.predict(offscreenCanvas2);
      setIcons(result);
      console.log(result);
    }
  };

  const onReaderLoad = (readerEvt) => {
    // setImgUrl(readerEvt.target.result);
    const img = new Image();
    img.onload = onImgLoad;
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = readerEvt.target.result;
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsDataURL(file);
  };

  const onPaste = (e) => {
    if (e.clipboardData) {
      const { items, files } = e.clipboardData;
      const reader = new FileReader();
      reader.onload = onReaderLoad;
      if (items && items.length) {
        // 粘贴的截图
        const item = items[0];
        if (/^image\//.test(item.type)) {
          const file = item.getAsFile();
          reader.readAsDataURL(file);
          return;
        }
      }
      if (files && files.length) {
        // 粘贴的文件
        const file = files[0];
        if (/^image\//.test(file.type)) {
          reader.readAsDataURL(file);
        }
      }
    }
  };
  useEffect(() => {
    (async () => {
      const model = await tf.loadLayersModel('/model.json');
      console.log('模型加载完成');
      window.iconClassifierModel = model;
      document.body.addEventListener('paste', onPaste);
    })();
    return () => {
      document.body.removeEventListener('paste', onPaste);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.uploadArea}>
        <div className={styles.placeholder}>拖拽、点击、截图上传图片</div>
        <input title="" type="file" accept="image/*" onChange={onFileChange} />
      </div>
      {imgUrl && <img crossOrigin="anonymous" className={styles.img} src={imgUrl} />}
      <div>
        {icons.length
          ? icons.map(icon => (
            <div key={icon.label}>
              <Icon size="large" type={icon.label} />
              <span>{icon.score}</span>
              <span>{icon.label}</span>
            </div>
          ))
          : null}
      </div>
    </div>
  );
};

export default Predict;
