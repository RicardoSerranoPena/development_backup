const fs = require('fs');
const pdfParse = require('pdf-parse');

const readPdf = async (uri) => {
    const buffer = fs.readFileSync(uri);
    try {
        const data = await pdfParse(buffer);
        // PDF text
        console.log('body text: ', data.text); 
        // number of pages
        console.log('num of pages: ', data.numpages);
        // number of rendered pages
        console.log('num of rendered pages: ', data.numrender);
        // PDF info
        console.log('info: ', data.info);
        // PDF metadata
        console.log('metadata: ', data.metadata); 
        // PDF.js version
        // check https://mozilla.github.io/pdf.js/getting_started/
        console.log('pdf version: ', data.version);
    }catch(err){
        throw new Error(err);
    }
}


// Testing
const DUMMY_PDF = './pdfs/nho_tu_sinh.pdf'
readPdf(DUMMY_PDF);


