# fe-publish
使用node-ssh模块，实现一条命令将打包文件快速更新到服务器对应路径，可用于快速发布；支持错误回滚。

## 安装
```
npm i fe-publish
or
yarn add fe-publish
```

## 使用
在项目根目录下新建dtstack.config.js，以JSON格式配置以下配置项:
* host 服务器ip，必填
* user 登录用户名，必填
* sourcePath 本地包路径，选填、默认为`./dist`
* targetPath 映射文件路径，必填, targetPath必须为真实已有的路径

配置示例
```
{
  "host": "127.0.0.1",
  "user": "root",
  "sourcePath": "./dist",
  "targetPath": "/tmp/dist"
}
```

在项目中的package.json里添加script
```
"scripts": {
  "publish": "fe-publish"
},
```

```
npm run publish
```

## 注意事项
targetPath 必须为一个真实路径，如/tmp/dist，必须要有dist这个目录

