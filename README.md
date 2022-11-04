<h1>File Compression BackEnd</h1>
<h3>Function</h3>
<p>
  This repository act as backend for the file compression program. <br>
  Interface allows user to type in folder/folders path , Name of file to be created, the fromDate
  and toDate which then compresses the files in given folder/folders with given 
  name between the given time interval.
  In backend, it uses socket.io inorder to send processing percentage to the frontend.
  Backend uses zlib package to compress the files.
</p>
<h3>Technologies Used</h3>
<p>
    FrontEnd : Angular <br>
    BackEnd : NodeJS <br>
    Communcation : Socket.io <br>
    Server : localhost 
</p>
<h3>How to use</h3>
<pre>
    Pre-requisites: Node v16.17.1
    After cloning the project,
    1. Open the project in VSCode
    2. Open terminal and type "npm install"
    3. After installation is complete, type "npm start"
    4. Wait for the server to starton localhost:3000
    5. The application should be up and running
    For Client side rendering
    6. clone https://github.com/Ashwin-Joshy/File_compression_FrontEnd
    7. Open the project in VSCode
    8. Open terminal and type "npm install"
    9. After installation is complete, type "npm start"
    10. The server should be up and running
    11. Open browser and type "localhost:4200"
    Now the application should be ready to use.   
</pre>
<h3>Bonus</h3>
<p>
    I am currenty working to make the entire server starting on front end and back end, also the opening of browser on local host easier
    by making all this execute with a single click. I'll be adding the feature in github repository at a later period of time. 
</p>
