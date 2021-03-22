
## Iconcook 图标识别

> 用 Pipcook 训练的图标识别工具

## 使用

```bash
# 安装依赖
$ npm install

# 启动服务
$ npm start

# 生成训练样本
http://localhost:3333

# 预览训练效果
http://localhost:3333/#/predict
```

## 流程

1、将图标名称列表存如 src/common/labels.js 中的 labels 数组

2、将图标名称和其 Unicode 编码以 key/value 的形式存入 src/common/labels.js 的 labelMap 对象

3、src/pages/create/index.jsx 中调整组件库名和样式，进入 http://localhost:3333 确认图标渲染正常

4、点击页面最下方的 "下载数据"（需要一段时间，console 有进度），将文件存入 iconData/icon.json

5、命令行运行 `node createImg.js`，会在 iconData/imgs 中生成图片训练集

6、将 iconData/imgs 下的三个文件夹打包为一个 zip 文件，得到训练集数据

7、调整 cook/icons.json 中的路径，命令行运行 `pipcook run cook/icons.json` 开始训练

8、完成训练后，将 cook/output/model 中的两个文件拷贝到 public 中

9、取出 cook/output/metadata.json 中 output/dataset 字段中的 labelArray 数组，放到 /src/pages/predict/index.jsx 的 resultLabels 字段

现在可以在 http://localhost:3333/#/predict 页面测试图标识别了
