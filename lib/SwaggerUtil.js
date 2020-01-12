const path = require('path'),
    fs = require('fs'),
    _ = require("underscore"),
    Router = require('koa-router'),
    handlebars = require('handlebars'),
    jsyaml = require('js-yaml');

function SwaggerUtil(configDirPath){
    this.configDirPath = configDirPath;
}

/**
 * 获取swagger及接口的router
 */
SwaggerUtil.prototype.getRoutes = function(){
    let router = new Router();
    let yamlFileNames = _.filter(fs.readdirSync(this.configDirPath), fileName => fileName.endsWith('.yaml'));
    for(let fileName of yamlFileNames){
        let spec = fs.readFileSync(path.join(this.configDirPath, fileName), 'utf8'),
            yamlData = jsyaml.safeLoad(spec),
            yamlJsonData = JSON.stringify(yamlData),
            fileRealName = fileName.split('.')[0],
            defaultYamlOptions = {
                title: 'Swagger UI',
                oauthOptions: false,
                swaggerOptions: {
                  dom_id: '#swagger-ui',
                  url: `/${fileRealName}json`,
                  layout: 'StandaloneLayout',
                },
                routePrefix: `/${fileRealName}`,
                swaggerVersion: '3.12.0',
                hideTopbar: false,
            };
        handlebars.registerHelper('json', context => JSON.stringify(context));
        let index = handlebars.compile(fs.readFileSync(path.join(__dirname, 'swagger.hbs'), 'utf8'));
        router.get(`/${fileRealName}json`, async (ctx, next) => {
            ctx.body = yamlJsonData;
        });
        
        router.get(`/${fileRealName}`, async (ctx, next) => {
            ctx.type = 'text/html';
            ctx.body = index(defaultYamlOptions);
        });
    }
    return router.routes();
}


module.exports = SwaggerUtil;