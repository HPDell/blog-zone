import * as express from "express";
import { Request, Response } from "express";
import * as path from "path";
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { createConnection } from "typeorm";

import index from './routes/index';
import api from './routes/api';
import login from './routes/login';
import { User } from "./entity/User";

export interface BlogZoneExpressRequest extends Request {
    user: User;
}

export class ExpressStatusError extends Error {
    status: number;
    constructor(parameters) {
        super(parameters);
    }
}

createConnection().then(connection => {
    const app = express();

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    // app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', index);
    app.use('/login', login)

    app.use(async function (req: BlogZoneExpressRequest, res: Response, next: Function) {
        if (req.method != "GET") {
            let user = req.cookies["user"];
            let token = req.cookies["token"];
            let userInfo = await connection.getRepository(User).findOne({
                id: user,
                token: token
            });
            if (userInfo) {
                req.user = userInfo;
                next();
            } else {
                return res.sendStatus(500);
            }
        } else {
            next();
        }
    })
    app.use('/api', api)

    // catch 404 and forward to error handler
    app.use(function (req: Request, res: Response, next: Function) {
        let err = new ExpressStatusError('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err: ExpressStatusError, req: Request, res: Response, next: Function) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        return res.sendStatus(err.status || 500);
    });

    var debug = require('debug')('huayang-maintenance-server:server');
    var http = require('http');

    /**
     * Get port from environment and store in Express.
     */

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);


    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}).catch((reason) => console.log(reason));