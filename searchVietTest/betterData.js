//require fs and pdf-parse library
const { response } = require('express');
const fs = require('fs');
const pdfParse = require('pdf-parse');
//directory of pdfs
const dir = './pdfs/';
//require the Elasticsearch library
const elasticsearch = require('elasticsearch');
// instantiate an Elasticsearch client
const client = new elasticsearch.Client({
   hosts: [ 'http://localhost:9200']
});

class FileNames {
    static async listPdfs(dir) {
        return new Promise(async function (resolve, reject) {
            fs.readdir(dir, async (err, fileNames) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log('files: ', fileNames);
                    resolve(fileNames);
                }
            });
        });
    }
}

class ReadPDF {
    static async readPdf(uri) {
        return new Promise(async function (resolve, reject) {
            const buffer = fs.readFileSync(uri);
            try {
                const data = await pdfParse(buffer);
                const {Title, Author, Subject, Keywords} = data.info;
                const keywordsList = Keywords.split(' ');
                const newPDF = {
                    'Title' : Title,
                    'Author' : Author,
                    'Subject' : Subject,
                    'Keywords' : keywordsList,
                }
                resolve(newPDF);
            } catch(err) {
                reject(err);
            }
        });
    }
}

class PDFArray {
    static async getPdfArray(dir, pdfsList){
        return new Promise(async function (resolve, reject) {
            const promises = pdfsList.map(pdf => ReadPDF.readPdf(dir+pdf));
            resolve(await Promise.all(promises));
        });
    }
}

//perform bulk indexing of the data passed
class BulkIndex {
    static async bulkIndex(bulk) {
        return new Promise(async function (resolve, reject) {
            client.bulk({body:bulk}, function( err, response  ){
                if( err ){
                    reject("Failed Bulk operation".red, err)
                } else {
                    console.log(response);
                    resolve("Successfully imported", bulk.size);
                }
            });
        });
    }
}

const getBulkArray = allPdfsRead => {
    let bulk = []
    allPdfsRead.forEach(pdfRead => {
        bulk.push({index: {
                        _index: "viet-books",
                        _type:"book",
                    }      
                });
        bulk.push(pdfRead);
    });
    return bulk;
}

// ping the client to be sure Elasticsearch is up
client.ping({
    requestTimeout: 30000,
}, function(error) {
// at this point, eastic search is down, please check your Elasticsearch service
    if (error) {
        console.error('Elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});

// create a new index called viet-books. If the index has already been created, this function fails safely
client.indices.create({
    index: 'viet-books'
}, function(error, response, status) {
    if (error) {
        //console.log(error);
    } else {
        console.log("created a new index", response);
    }
});

let fileNames = FileNames.listPdfs(dir);
fileNames.then((fileNames) => {
    let pdfsArray = PDFArray.getPdfArray(dir, fileNames);
    pdfsArray.then((allPdfsRead) => {
        let bulkArray = getBulkArray(allPdfsRead);
        let indexedPdfs = BulkIndex.bulkIndex(bulkArray);
        indexedPdfs.then((response) => console.log(response))
    });
});

