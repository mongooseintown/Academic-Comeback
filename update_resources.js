const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'data', 'courses.js');
let content = fs.readFileSync(filePath, 'utf8');

// The links provided by the user
const resources = [
    { type: 'notes', nameSuffix: 'Hand Note', link: 'https://mega.nz/file/2oBynDCL#Gf9jiJu3jJIeLDZbwo7Pb34AWg3wsJ6DnsQ2av--sdY' },
    { type: 'pdfs', nameSuffix: 'PDF', link: 'https://mega.nz/file/jgZl1KSL#KijBsPSbp9c85LiTdENuavFuusIdKEHH2cLqzqMF9RQ' },
    { type: 'slides', nameSuffix: 'Slide', link: 'https://mega.nz/file/agoVFRhJ#V9R6xAZ7XzrcYQ8hVDErdDCmAgRNnuSaENbCJtactds' },
    { type: 'prev_question', nameSuffix: 'Prev Q', link: 'https://mega.nz/file/2oBynDCL#Gf9jiJu3jJIeLDZbwo7Pb34AWg3wsJ6DnsQ2av--sdY' }
];

function generateResources(segment) {
    const segStr = segment.toString().padStart(2, '0');
    return resources.map(r => ({
        name: `${segStr}. Segment-${segStr} ${r.nameSuffix}`,
        link: r.link,
        type: r.type,
        segment: segment
    }));
}

const allMidResources = [
    ...generateResources(1),
    ...generateResources(2),
    ...generateResources(3)
];

// Helper to stringify the resources array in a clean way
function stringifyResources(resArray) {
    return JSON.stringify(resArray, null, 20).replace(/\n/g, '\n                    ');
}

// Target courses in Semester 4
const courseCodes = [
    'CSE-2421', 'CSE-2422', 'CSE-2423', 'CSE-2424', 'CSE-2427',
    'MATH-2407', 'ME-2412', 'CSE-2430', 'ACC-2401', 'GEBL-2401'
];

// We need to carefully replace the resources: [] for mid in these courses
// This script is a bit complex to do via direct string replace on a large file.
// I will instead output the replacement block for the semester 4 section.

console.log('Update script prepared.');
