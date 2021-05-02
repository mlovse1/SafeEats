require("dotenv").config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV ==="production";

//const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const connectionString = `postgres://azcvemmqgkpefp:8d175676ce163ee64902f0400c8c25877452b6b831865b4193c812327ff85a03@ec2-54-167-152-185.compute-1.amazonaws.com:5432/d5jia9p079lejo`;
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: { rejectUnauthorized: false }

});

module.exports = { pool };