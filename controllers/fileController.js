const fs = require('fs');
const { promises: fsp } = require('fs');
const archiver = require('archiver');
const readline = require('readline');
const { resolve } = require('path');
const fileController = {
    status: "Idle",
    archiveFile: async (fromPath, toPath, fromD, toD, zipName) => {
        return new Promise(async (resolve, reject) => {
            let output;
            fileController.status = "Starting"
            let toDate = new Date(toD)
            console.log('toDate' + toDate);
            let fromDate = new Date(fromD)
            console.log('fromDate' + fromDate);
            try {

                const files = await fsp.readdir(fromPath)
                console.log('Length of files', files.length);
                if (files.length == 0) {
                    reject('No files found');
                }
                //Step 2 - create a file to stream archive data to

                output = fs.createWriteStream(`${toPath}/${zipName}.zip`);
                const archive = archiver('zip', {
                    zlib: { level: 9 }
                });

                //Step 3 - callbacks 
                output.on('close', () => {
                    fileController.status = "Completed"
                    console.log('Archive finished.');
                    //output.end();
                    resolve('Done')
                });

                archive.on('error', (err) => {
                    console.log('throwing error');
                    throw err;
                });
                //Step 4 - pipe and append files
                archive.pipe(output);
                for (let i = 0; i < files.length; i++) {
                    //await fileController.validateFile(`${fromPath}/${files[i]}`);
                    let fileDate;
                    let stats = fs.statSync(`${fromPath}/${files[i]}`)
                    fileDate = new Date(stats.mtimeMs);
                    console.log(fileDate);
                    console.log('Less than to date', fileDate < toDate);
                    console.log('Greater than from date', fileDate > fromDate);
                    if (fileDate > fromDate) {
                        archive.append(fs.createReadStream(`${fromPath}/${files[i]}`), { name: `${files[i]}` });

                        fileController.status = (i + 1) / files.length * 100;
                    }

                }

                //Step 5 - finalize
                archive.finalize();

            }
            catch (error) {
                console.log('error', error.code);
                //output.emit('close')
                if (error.code == 'ENOENT') {
                    console.log('No such file or directory');
                    reject(error)
                }
                else {
                    console.log('Passed if');
                    output.end()
                    await fsp.rm(`${toPath}/${zipName}.zip`)
                    fileController.status = "Error"
                    reject(error)
                }

            }
        })
    },
    validateFile: (filename) => {
        //Function: To read a given file line by line and validate the file
        //Input: filename to be validated
        //Output: Promise which contain the result of validation
        //Step1: Read the file line by line
        //Step2: check for the number of HDR, TDR, Line Count
        //Step3: If HDR, TDR count go above 1 or line count is more than 2 then file is not valid
        //Step4: If file reached end satisfying the above condition then file is valid
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: fs.createReadStream(filename),
                crlfDelay: Infinity
            });
            let hdrCount, tdrCount, lineCount = 0;
            rl.on('line', (line) => {
                console.log(line);
                lineCount++;//Check for no of line
                if (hdrCount > 1 || tdrCount > 1 || lineCount > 2 || (!line.includes('HDR') && !line.includes('TDR'))) {
                    console.log('File is not valid', line);
                    reject('Validation Failed')
                }
                if (line.includes('HDR')) {
                    hdrCount++;//To count the number of HDR
                }
                else if (line.includes('TDR')) {
                    tdrCount++;//To count the number of TDR
                }
            });
            rl.on('close', () => {//Check for end of file
                console.log('Validation Success');
                resolve('Validation Success')  //return
            })
        })
    },
}
module.exports = fileController;