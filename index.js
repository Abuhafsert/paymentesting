import express from "express";
import bodyParser from "body-parser"


import pg from "pg";

import dotenv from 'dotenv';
const app = express();

dotenv.config()


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

const ports = 2020


const db = new pg.Client({
    connectionString: process.env.DBConfigLink,
    ssl: {
        rejectUnauthorized: false
    }
})


db.connect()



app.get('/', async (req, res) => {
    res.render('index.ejs')
})

app.post('/payment', async (req,res) => {
    res.send(req.body)
})






app.listen(ports, () => {
    console.log(`Listening on port ${ports}`);
  });
  