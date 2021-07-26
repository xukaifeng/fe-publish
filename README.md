# fe-publish-ssh

使用 node-ssh 模块，实现一条命令，自动打包（自动执行 npm run build）并将打包文件快速更新到服务器对应路径，可用于快速发布；支持错误回滚及多环境配置。

## 安装

```
npm i fe-publish-ssh
or
yarn add fe-publish-ssh
```

## 使用

在项目根目录下新建 .ferc 配置文件。以 JSON 格式配置以下配置项，支持多个分组，并默认导出:

- host 服务器 ip，必填
- user 登录用户名，必填
- sourcePath 本地包路径，选填、默认为`./dist`
- targetPath 映射文件路径，必填, targetPath 必须为真实已有的路径
- closeAutoBuild 是否需要关闭自动打包功能，选填，不传默认为 false
- closeRollBack 是否需要关闭自动备份、错误回滚功能，选填，不传默认为 false

配置示例

```
[
  {
    "alias": "开发环境",
    "host": "127.0.0.2",
    "user": "root",
    "sourcePath": "./dist",
    "targetPath": "/test"
  },
  {
    "alias": "测试环境",
    "host": "127.0.0.1",
    "user": "root",
    "sourcePath": "./dist",
    "targetPath": "/test"
  }
]
```

在项目中的 package.json 里添加 script

```
"scripts": {
  "pub": "fe-publish-ssh"
},
```

```
npm run pub
或
fe-publish
```

## ToDo

- 文件上传时先传递到临时文件夹，再执行备份、重命名等操作。

## 注意事项

自动自动备份、错误回滚功能默认启用，此时 targetPath 必须为一个真实路径，如/tmp/dist，必须要有 dist 这个目录；
