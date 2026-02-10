require('dotenv').config();
const mongoose = require('mongoose');
const Case = require('./src/models/Case');

async function exportCases() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const cases = await Case.find({});
        console.log(JSON.stringify(cases, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

exportCases();
