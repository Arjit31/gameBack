const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.send('Here is the key');
})

module.exports = router;