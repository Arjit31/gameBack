const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.send('Connected');
})

module.exports = router;