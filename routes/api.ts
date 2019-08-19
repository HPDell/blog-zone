import * as express from 'express';
let router = express.Router();

import saying from './apis/saying';
import post from './apis/post';
import picture from './apis/picture';
import category from './apis/category';
import tag from './apis/tag';
import comment from './apis/comment';

router.use("/saying", saying);
router.use("/post", post);
router.use("/picture", picture);
router.use("/category", category);
router.use("/tag", tag);
router.use("/comment", comment);

export default router;
