import { Server } from "socket.io";



export default (appExpress: any, serverOptions: any) => {
  const io = new Server(appExpress, serverOptions);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('connect-app', (arg) => {
      console.log('connect-app', arg);
    });

    socket.on('disconnect-app', (arg) => {
      console.log('disconnect-app', arg);
    });
  });
}
