import express from 'express';
import 'dotenv/config';

const app = express();

app.get("/", (req, res) =>  {
    res.send("Hello World!")
})

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Webserver started at port ${process.env.EXPRESS_PORT}`)
})