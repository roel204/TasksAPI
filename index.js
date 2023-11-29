import express from 'express';
import 'dotenv/config';

const app = express();

app.get("/", (req, res) =>  {
    res.send("Hello World!")
})

app.get("/test", (req, res) => {
    res.json({
        "products": [
            {
                "id": "1",
                "name": "Kaas",
                "Price": 5
            },
            {
                "id": "1",
                "name": "Chips",
                "Price": 1
            }
        ]
    })
})

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Webserver started at port ${process.env.EXPRESS_PORT}`)
})