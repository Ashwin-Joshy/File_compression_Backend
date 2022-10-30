var express = require('express');
var router = express.Router();
const fileController = require('../controllers/fileController');

/* GET home page. */
router.post('/', async function (req, res, next) {
  let data;
  console.log(req.body);

  try {
    let from = req.body.from;
    let to = req.body.to;
    let fromDate = req.body.fromdate;
    let toDate = req.body.todate;
    let zipName=req.body.zipname;
    data = await fileController.archiveFile(from, to, fromDate, toDate, zipName);
  }
  catch (err) {
    data = err
  }
  finally {
    res.send(data)
  }
});

module.exports = router;
