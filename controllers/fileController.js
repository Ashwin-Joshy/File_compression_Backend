const fs = require('fs');
const { promises: fsp } = require('fs');
const archiver = require('archiver');
const readline = require('readline');
const { resolve } = require('path');
const fileController = {
    status: "Idle",
    archiveFile: async (fromPath, toPath, fromD, toD, zipName, socket, currentPath) => {
        return new Promise(async (resolve, reject) => {
            fileController.status = "Busy";
            let output;
            let toDate = new Date(toD)
            let fromDate = new Date(fromD)
            handleAsyncError = async (error) => {
                console.log('error', error);
                //output.emit('close')
                fileController.status = "Idle";
                if (output == "") {
                    reject(error)
                }
                else {
                    output.end()
                    await fsp.rm(`${toPath}/${zipName}.zip`)
                    reject(error)
                }
            }
            try {
                const files = await fsp.readdir(fromPath)
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
                    console.log('Archive finished.');
                    socket.emit('chat', `Completed`);
                    fileController.status = "Idle";
                    resolve('Completed');
                });

                archive.on('error', (err) => {
                    console.log('throwing error');
                    handleAsyncError(err);
                });

                //Step 4 - pipe and append files
                archive.pipe(output);
                let percentage = 0;
                let fileDate;
                let stats
                for (let i = 0; i < files.length; i++) {
                    //await fileController.validateFile(`${fromPath}/${files[i]}`);

                    stats = fs.statSync(`${fromPath}/${files[i]}`)

                    fileDate = new Date(stats.mtimeMs);
                    console.log(fileDate);
                    console.log('Less than to date', fileDate < toDate);
                    console.log('Greater than from date', fileDate > fromDate);
                    if (stats.isDirectory()) {
                        console.log('directory found');
                        // append files from a sub-directory and naming it `new-subdir` within the archive
                        archive.directory(`${fromPath}/${files[i]}/`,`${files[i]}`);
                    }
                    else if (fileDate > fromDate) {
                        archive.append(fs.createReadStream(`${fromPath}/${files[i]}`), { name: `${files[i]}` });
                    }
                    percentage = (i) / files.length * 100;
                    socket.emit('chat', `Processing path ${currentPath} : ${percentage.toFixed(2)}%`);
                }

                //Step 5 - finalize
                socket.emit('chat', `Compressing file ${currentPath} : This might take a while`);
                archive.finalize();

            }
            catch (error) {
                /*We are passing the error to another function because we want to handle the error 
                 of .on('error',(error)) properly too, if not the error is not caught properly and handled
                 due to try catch scope issues. Other than typng the entire error section again inside .on('error)
                 it is better to write it in another function and call it   */
                handleAsyncError(error);

            }
        })
    },
    validate:  (data) => {
        return new Promise(async (resolve, reject) => {
            
            
            console.log('data', data);
            console.log(data.from);
            let from = data.from.split(',');
            let to = data.to.split(',');
            let fromLength = from.length;
            let toLength = to.length;
            if(data.from=="" || data.to=="" || data.zipname=="" || data.fromdate=="" || data.todate==""){
                reject({
                    type:'error',
                    message:'Invalid data'
                });
            }
            else if (toLength != fromLength || fromLength == 0 || toLength == 0 ) { 
                reject({
                    type:'error',
                    message:'No of From and To paths are not equal or are empty'
                });
            }
            else {
                reject({
                    type:'error',
                    message:'Valid data'
                });
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