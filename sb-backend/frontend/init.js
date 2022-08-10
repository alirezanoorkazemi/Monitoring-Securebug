require('./../appConfig');
require('./../libs/core');

frontend = express();
frontend.use(express.static('frontend/assets'));
frontend.disable('x-powered-by');
frontend.locals.isDebug = isDebug;