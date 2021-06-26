//require fs and pdf-parse library
const fs = require('fs');
const pdfParse = require('pdf-parse');
//require the Elasticsearch library
const elasticsearch = require('elasticsearch');
// instantiate an Elasticsearch client
const client = new elasticsearch.Client({
   hosts: [ 'http://localhost:9200']
});
//directory of pdfs
const dir = './pdfs/';

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
// client.indices.create({
//     index: 'viet-books'
// }, function(error, response, status) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("created a new index", response);
//     }
// });

// client.index({
//     index: 'viet-books',
//     id: '1',
//     type: 'books',
//     body: {
//         'Title': data.info,
//         'Subject': data.info,
//         'Body': data.text,
//     },
// }, function(err, resp, status) {
//     console.log('response: ', resp);
//     console.log('it worked');
// });

//create array of list of pdfs
let listOfPdfs = [];

// list all files in the directory
fs.readdir(dir, (err, pdfs) => {
    if (err) {
        console.log(err);
    } else {
        console.log(pdfs);
    }
})



console.log('list of pdfs: ', nameFiles);

//read pdf
const readPdf = async(uri) => {
    const buffer = fs.readFileSync(uri);
    try {
        const data = await pdfParse(buffer);
        //PDF info
        const {Title, Author, Subject, Keywords} = data.info;
        //console.log('title: ', Title);
        //console.log('author: ', Author);
        //console.log('subject: ', Subject);
        keywordsList = Keywords.split(' ')
        //console.log('keywords: ', keywordsList);
	const newPdf = {
	    'Title' : Title,
	    'Author' : Author,
	    'Subject' : Subject,
	    'Keywords' : keywordsList
	};
	return newPdf;
    }catch(err){
        throw new Error(err);
    }
}

myNewPdf = readPdf(dir+'viet.pdf');


// declare an empty array called bulk
var bulk = [];
// list all files in the directory
// fs.readdir(dir, (err, pdfs) => {
//     if (err) {
//         throw err;
//     }
//     console.log('files: ', pdfs)
//     pdfs.forEach(pdf => {
//         bulk.push({index: {
//                         _index: "viet-books",
//                         _type:"book",
//                     }      
//                 })
//         bulk.push(readPdf(dir+pdf))
//     })
// });


// setTimeout(() => { console.log(bulk); }, 20000 );


//loop through each book and create and push two objects into the array in each loop
//first object sends the index and type you will be saving the data as
//second onject is the data you want to index




//perform bulk indexing of the data passed
// client.bulk({body:bulk}, function( err, response  ){
//     if( err ){
//         console.log("Failed Bulk operation".red, err)
//     } else {
//         console.log("Successfully imported %s".green, pdfs.length);
//     }
// });
