const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.send('Main Game');
    console.log("hi");
})

module.exports = router;