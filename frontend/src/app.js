require('dotenv').config();

const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT

app.use(express.json());
