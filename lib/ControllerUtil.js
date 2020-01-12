const fs = require("fs"),
    _ = require("underscore"),
    path = require("path"),
    Router = require('koa-router'),
    assert = require("assert"),
    jsyaml = require('js-yaml');

function mkdirCycle(dirPath) {
    let pathSplit = dirPath.split('\\'),
        pathOrigin = null;
    for (let i = 0; i < pathSplit.length; i++){
        pathOrigin = pathOrigin ? path.join(pathOrigin, pathSplit[i]) : pathSplit[i];
        if (!fs.existsSync(pathOrigin)) {
            fs.mkdirSync(pathOrigin);
        }
    }
}

function ControllerUtil(configDirPath, controllerDirPath) {
    this.configDirPath = configDirPath;
    this.controllerDirPath = controllerDirPath;
}

/**
 * append interface to file ,create file if not exists
 * @param apiFilePath
 * @param controllerClassName
 * @param interfaceName
 * @param method
 * @param summary
 * @param description
 * @param parameters
 */
ControllerUtil.prototype.appendInterfaceToFile = function (apiFilePath, controllerClassName, interfaceName, method, summary, description, parameters = []) {
    if (!fs.existsSync(apiFilePath)) {
        let content =
            '\n'
            + `function ${controllerClassName}() {\n`
            + '\n'
            + `}\n`
            + '\n'
            + '//############interface area###############\n'
            + '//############interface area###############\n'
            + '\n'
            + `module.exports = new ${controllerClassName}();\n`;
        fs.writeFileSync(apiFilePath, content);
    }
    let contentBefore = fs.readFileSync(apiFilePath).toString('utf8'),
        contentSplit = contentBefore.split('//############interface area###############\n');
    if ((contentSplit[1] || '').includes(`${controllerClassName}.prototype.${interfaceName}`)) {
        return;
    }
    let interfaceContentI = ''
        + `/**\n`
        + ` * @method ${method}\n`
        + ` * @summary ${summary}\n`
        + ` * @description ${description}\n`;
    for (let param of parameters) {
        interfaceContentI += ` * @requestParam ${param.name || ''} ${param.description || ''}\n`;
    }
    interfaceContentI = interfaceContentI
        + ' *  */\n'
        + `${controllerClassName}.prototype.${interfaceName} = async function (ctx, next){\n`;
    if (method.toLowerCase() == 'post' || method.toLowerCase() == 'get') {
        interfaceContentI = interfaceContentI
            + `\tconst paramsBody = ${method.toLowerCase()=='post'? 'ctx.request.body': 'ctx.params' },\n`;
        for (let i = 0; i < parameters.length; i++) {
            let param = parameters[i];
            interfaceContentI = interfaceContentI
                + `\t\t${param.name} = paramsBody.${param.name}${i == parameters.length - 1 ? ';' : ','}\n`;
        }
    }
    interfaceContentI = interfaceContentI
        + '\tctx.body = { code: 200 };\n'
        + `}\n`
        + `\n`;
    let contentNew = contentSplit[0]
        + '//############interface area###############\n'
        + contentSplit[1]
        + interfaceContentI
        + '//############interface area###############\n'
        + contentSplit[2];
    fs.writeFileSync(apiFilePath, contentNew, { encoding: 'utf8' });
}

/**
 * 对于接口文档中定义的每一个接口，如果不存在，则生成controller文件，并填充代码及注释。
 */
ControllerUtil.prototype.checkForBuildNewController = function () {
    let configDirPath = this.configDirPath
        controllerDirPath = this.controllerDirPath; 
    if (!fs.existsSync(configDirPath)) {
        throw new Error('config dir path error');
    }
    if (!fs.existsSync(controllerDirPath)) {
        mkdirCycle(controllerDirPath);
    }
    let swaggerFileNames = _.filter(fs.readdirSync(configDirPath), fileName => fileName.endsWith('.yaml'));
    for (let swaggerFileName of swaggerFileNames) {
        let spec = fs.readFileSync(path.join(configDirPath, swaggerFileName), 'utf8'),
            yamlData = jsyaml.safeLoad(spec),
            pathsObj = yamlData ? (yamlData.paths || {}) : {};
        
        for (let apiName in pathsObj) {
            let v1 = pathsObj[apiName],
                method = Object.keys(v1)[0],
                v2 = v1[method],
                description = v2.description || '',
                parameters = v2.parameters || [],
                responses = v2.responses || {},
                summary = v2.summary || '',
                apiNameSplit = _.reject(apiName.split('/'), item => item.startsWith('{') || item.endsWith('}'));
                interfaceName = apiNameSplit[apiNameSplit.length - 1],
                controllerFileDirPath = path.join(
                    controllerDirPath,
                    ...(apiNameSplit.length >= 3 ? _.reject(apiNameSplit.slice(0, apiNameSplit.length - 2), item => item == '') : [])
                ),
                controllerFileName = (apiNameSplit.length >= 2 ? apiNameSplit[apiNameSplit.length - 2] : 'common'),
                controllerFilePath = path.join(controllerFileDirPath, controllerFileName + '.js');
            
            if (!fs.existsSync(controllerFileDirPath)) {
                mkdirCycle(controllerFileDirPath);
            }
            this.appendInterfaceToFile(
                controllerFilePath,
                controllerFileName.charAt(0).toUpperCase() + '' + controllerFileName.slice(1, controllerFileName.length),
                interfaceName,
                method,
                summary,
                description,
                parameters
            );
        }
    }
   
}

/**
 * init router in controller dir
 */
ControllerUtil.prototype.getRoutes = function () {
    let configDirPath = this.configDirPath;
    if (!fs.existsSync(configDirPath)) {
        throw new Error('config dir path error');
    }
    let router = new Router();
    let swaggerFileNames = _.filter(fs.readdirSync(configDirPath), fileName => fileName.endsWith('.yaml'));
    for (let swaggerFileName of swaggerFileNames) {
        let spec = fs.readFileSync(path.join(configDirPath, swaggerFileName), 'utf8'),
            yamlData = jsyaml.safeLoad(spec),
            pathsObj = yamlData ? (yamlData.paths || {}) : {};
        
        for (let apiName in pathsObj) {
            let v1 = pathsObj[apiName],
                method = Object.keys(v1)[0];
            if (!router[method]) {
                throw new Error(`request error in yaml, method:${method}`);
            }
            let apiNameSplit = _.reject(apiName.split('/'), item => item.startsWith('{') || item.endsWith('}')),
                apiFileRelativePath = _.reject(apiNameSplit.slice(0, apiNameSplit.length - 1), item => item == '').join('/'),
                modelT = require(path.join(this.controllerDirPath , apiFileRelativePath)),
                interfaceFunc = modelT[apiNameSplit[apiNameSplit.length - 1]];
            assert(interfaceFunc, `interface func not found, apiName:${apiName}`);
            router[method](apiName.replace(new RegExp('{', 'g'), ':').replace(new RegExp('}', 'g'), ''), interfaceFunc);
        }
    }
    return router.routes();
}

module.exports = ControllerUtil;