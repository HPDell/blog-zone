import * as express from 'express';
let router = express.Router();

import saying from './apis/saying'

router.use("/saying", saying);

export default router;
