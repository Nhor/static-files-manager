const _ = require('lodash');
const Config = require('./Config');
const Logger = require('./utils/Logger');
const Database = require('./utils/Database');
const Router = require('./utils/Router');
const Server = require('./utils/Server');
const ErrorCode = require('./routes/ErrorCode');
const Login = require('./routes/Login');
const Logout = require('./routes/Logout');
const Check = require('./routes/Check');
const List = require('./routes/List');
const Upload = require('./routes/Upload');
const Create = require('./routes/Create');
const Move = require('./routes/Move');
const Remove = require('./routes/Remove');

let database = new Database(Config.database);
let server = new Server(Config.name, Config.version, Config.port);
let router = new Router(Config.allowedOrigins);

router.addRoute('GET', '/error-code', ErrorCode.GET);

router.addRoute('POST', '/login',  Login.POST,  {database: database, sessionProps: Config.session});
router.addRoute('GET',  '/check',  Check.GET,   {database: database});
router.addRoute('POST', '/logout', Logout.POST, {database: database});

router.addRoute('GET',    '/list/*', List.GET,      {database: database});
router.addRoute('POST',   '/upload', Upload.POST,   {database: database}, 'multipart');
router.addRoute('POST',   '/create', Create.POST,   {database: database});
router.addRoute('PUT',    '/move',   Move.PUT,      {database: database});
router.addRoute('DELETE', '/remove', Remove.DELETE, {database: database});

server.addRouter('/api', router);
server.addStatic('/static', 'static');

server.addStatic('/front/dependencies', 'dist/front/dependencies');
server.addStatic('/front/static', 'dist/front/static');
server.addStatic('/front/js', 'dist/front/js');
server.addStatic('/front/css', 'dist/front/css');
server.addReactRouterFrontend('', 'dist/front/html/index.html');

server
  .listen()
  .then(params => Logger.info(`${params.name} v${params.version} server listening on http://127.0.0.1:${params.port}...`));
