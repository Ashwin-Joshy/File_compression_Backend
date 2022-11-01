module.exports = (io, data) => {
    io.emit('chat', 'This is must')
    io.on('connection', socket => {
        console.log('new connection', socket.id);
        socket.on('start', async (data) => {
            let fileController = require('../controllers/fileController');
            if (fileController.status != "Idle") {
                socket.emit('chat', 'Server Busy, Please try again later');
            }
            else {
                try {
                    from = data.from.split(',');
                    to = data.to.split(',');
                    if (to.length !== from.length) {
                        throw new Error('No of From and To paths are not equal');
                    }
                    console.log(from, 'FROM');
                    console.log(to, 'TO');

                    for (let i = 0; i < from.length; i++) {
                        result = await fileController.archiveFile(from[i], to[i], data.fromdate, data.todate, data.zipname, socket, i + 1);

                    }
                }
                catch (error) {
                    result = error.message;
                }
                finally {
                    socket.emit('chat', result);
                }
            }

        })
        socket.on('disconnect', () => console.log('disconnected'));
    })

}