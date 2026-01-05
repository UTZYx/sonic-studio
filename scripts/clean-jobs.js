const fs = require('fs');
const path = require('path');

const jobsPath = path.join(process.cwd(), 'data/jobs.json');
if (fs.existsSync(jobsPath)) {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'));
    const keys = Object.keys(data);
    // Keep only last 10 jobs to keep it snappy
    const keepKeys = keys.slice(-10);
    const newData = {};
    keepKeys.forEach(k => {
        // Strip out the massive data URIs for old results to truly shrink it
        const job = data[k];
        if (job.result && job.result.url && job.result.url.length > 1000) {
            job.result.url = "data:audio/mpeg;base64,CLEANED";
        }
        newData[k] = job;
    });
    fs.writeFileSync(jobsPath, JSON.stringify(newData, null, 2));
    console.log(`Cleaned jobs.json. Kept ${keepKeys.length} entries.`);
}
