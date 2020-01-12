const   Router = require('koa-router'),
    ControllerUtil = require('./ControllerUtil'),
    SwaggerUtil = require("./SwaggerUtil");

function SwaggerExtra(configDirPath, controllerDirPath, isSwaggerOpen = true, isAutoFixControllersOpen = true){
    let controllerUtil = new ControllerUtil(configDirPath, controllerDirPath),
        swaggerUtil = new SwaggerUtil(configDirPath),
        router = new Router();

    if(isAutoFixControllersOpen){
        controllerUtil.checkForBuildNewController()
    }

    if(isSwaggerOpen){
        router.use(swaggerUtil.getRoutes());
    }

    router.use(controllerUtil.getRoutes());
    this.router = router;
}

SwaggerExtra.prototype.getRoutes = function(){
    return this.router.routes();
}

module.exports = SwaggerExtra;