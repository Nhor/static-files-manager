let _ = require('lodash');
let Config = require('./Config');
let Logger = require('./utils/Logger');
let Database = require('./utils/Database');
let Router = require('./utils/Router');
let Server = require('./utils/Server');
let Login = require('./routes/Login');
let Logout = require('./routes/Logout');

let database = new Database(Config.database);
let server = new Server(Config.name, Config.version, Config.port);
let router = new Router();

router.addRoute('POST', '/login',  Login.POST,  {database: database, sessionProps: Config.session});
router.addRoute('POST', '/logout', Logout.POST, {database: database});

server.addRouter('/', router);

server
  .listen()
  .then(params => Logger.info(`${params.name} v${params.version} server listening on http://127.0.0.1:${params.port}...`));
