const express = require("express");
const {scrapeLogic} = require("./scrapeLogic")

const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res)=>{
    res.send("Live server is running!");
})

app.get("/scrape", (req, res)=>{
    scrapeLogic(res)
})

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})