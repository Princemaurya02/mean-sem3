require('dotenv').config();
const mongoose = require('mongoose');
const Case = require('./src/models/Case');
const User = require('./src/models/User');
const fs = require('fs');

async function importCases() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find an admin user to be the performer
        const admin = await User.findOne({ role: 'Admin' });
        if (!admin) {
            console.error('No admin user found. Please run seed.js first.');
            process.exit(1);
        }

        const casesData = JSON.parse(fs.readFileSync('./cases_to_import.json', 'utf8'));

        for (const data of casesData) {
            // Add initial timeline entry
            data.timeline = [{
                event: 'Case Filed',
                description: 'Case has been filed in the court via bulk import',
                performedBy: admin._id,
                date: new Date()
            }];

            const newCase = await Case.create(data);
            console.log(`✅ Stored Case: ${newCase.caseTitle} (Number: ${newCase.caseNumber})`);
        }

        console.log('\n🚀 All cases stored successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing cases:', error.message);
        process.exit(1);
    }
}

importCases();
