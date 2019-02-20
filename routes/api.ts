import * as express from 'express';
let router = express.Router();

import saying from './apis/saying'
import post from './apis/post'

router.use("/saying", saying);
router.use("/post", post);

export default router;
