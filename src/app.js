const _ = require('lodash');
const Config = require('./Config');
const Logger = require('./utils/Logger');
const Database = require('./utils/Database');
const Router = require('./utils/Router');
const Server = require('./utils/Server');
const Login = require('./routes/Login');
const Logout = require('./routes/Logout');
const Upload = require('./routes/Upload');
const Create = require('./routes/Create');
const Move = require('./routes/Move');
const Remove = require('./routes/Remove');

let database = new Database(Config.database);
let server = new Server(Config.name, Config.version, Config.port);
let router = new Router();

router.addRoute('POST', '/login',  Login.POST,  {database: database, sessionProps: Config.session});
router.addRoute('POST', '/logout', Logout.POST, {database: database});

router.addRoute('POST',   '/upload', Upload.POST,   {database: database}, 'multipart');
router.addRoute('POST',   '/create', Create.POST,   {database: database});
router.addRoute('PUT',    '/move',   Move.PUT,      {database: database});
router.addRoute('DELETE', '/remove', Remove.DELETE, {database: database});

server.addRouter('/api', router);
server.addStatic('/static', 'static');

server
  .listen()
  .then(params => Logger.info(`${params.name} v${params.version} server listening on http://127.0.0.1:${params.port}...`));
