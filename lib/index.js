const   Router = require('koa-router'),
    ControllerUtil = require('./ControllerUtil'),
    SwaggerUtil = require("./SwaggerUtil");

function SwaggerExtra(configDirPath, controllerDirPath, options) {
    let isSwaggerOpen = options.isSwaggerOpen || true,
        isAutoFixControllersOpen = options.isAutoFixControllersOpen || true,
        postBodyGetCode = options.postBodyGetCode || 'ctx.request.body',
        getParamsGetCode = options.getParamsGetCode || 'ctx.params',
        controllerReturnCode = options.controllerReturnCode || "ctx.body = {code: 200, 'message': 'success', data: {}};";

    let controllerUtil = new ControllerUtil(configDirPath, controllerDirPath, postBodyGetCode, getParamsGetCode, controllerReturnCode),
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