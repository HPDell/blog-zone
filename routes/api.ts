import * as express from 'express';
let router = express.Router();

import saying from './apis/saying';
import post from './apis/post';
import picture from './apis/picture';
import category from './apis/category';

router.use("/saying", saying);
router.use("/post", post);
router.use("/picture", picture);
router.use("/category", category);

export default router;
