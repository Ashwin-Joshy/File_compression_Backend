module.exports = (io, data) => {
    io.emit('chat', 'This is must')
    io.on('connection', socket => {
        console.log('new connection', socket.id);
        socket.on('start', async (data) => {
            let fileController = require('../controllers/fileController');
            try{
                result = await fileController.archiveFile(data.from, data.to, data.fromdate, data.todate, data.zipname,socket);
            }
            catch(error){
                result = error.message;
            }
            finally{
                socket.emit('chat', result);
            }
           
        })
        socket.on('disconnect', () => console.log('disconnected'));
    })

}