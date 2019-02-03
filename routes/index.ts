import * as express from 'express';
import { join } from 'path';
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(join(__dirname, "../public/index.html"));
});

export default router;
