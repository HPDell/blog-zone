# 博客空间（后端）

这是我自己写的博客空间的后端。前端仓库： `hpdell/blog-zone-views` 。

已声明实体：

- 用户：`User`
- 微文：`Saying`
- 博文：`Post`
- 图片：`Picture`
- 评论：`Comment`

已实现接口：

- `api`
  - `post`
  - `saying`
  - `picture`
  - `comment`
- `login`

待实现功能：

- [ ] 添加或删除微文、博文的后端权限控制
- [ ] 用户和微文、博文关联
- [ ] 清理服务器中无用的图片
- [ ] `multer` 传文件中间件对文件类型进行过滤

未来可能添加到功能：

- [x] 多用户
- [ ] 上传头像