let mongoose = require('mongoose');
let dotenv = require('dotenv');

dotenv.config();

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose
            .connect(process.env.MONGO_URI)
            .then(() => {
                console.log('Database connection successful');
            })
            .catch((err) => {
                console.error('Database connection error');
            });
    }
}

module.exports = new Database();