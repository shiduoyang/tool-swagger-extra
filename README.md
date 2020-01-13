# swagger-extra
基于swagger.yaml的nodejs接口映射工具，应用于KOA框架中。

#### 相比于直接使用swagger的优点

* 根据yaml，自动生成接口文件xx.js
* 根据yaml，自动生成接口的路由
* 根据yaml名称生成访问swagger的路由

只需要编写swagger，接口就能可用，与创建controller等烦躁的工作说再见。

#### 使用

* 第一步，创建SwaggerExtra实例

```javascript
let SwaggerExtra = require('swagger-extra'),
    swaggerExtra = new SwaggerExtra(
        path.join(__dirname, 'config', 'controller'),
        path.join(__dirname, 'controller'),
        {
            //是否生成swagger相关路由，默认为是
            isAutoFixControllersOpen: true, 
            //是否将接口自动写入接口文件xx.js，默认为是
            isSwaggerOpen: true,
            //获取post参数对象的代码，默认为：ctx.request.body
            postBodyGetCode: 'ctx.request.body',
            //获取get参数对象的代码，默认为：ctx.param
            getParamsGetCode: 'ctx.params',
            //返回数据格式，示例：ctx.body = {code: 200, 'message': 'success', data: {}}
            controllerReturnCode: 'ctx.body = {code: 200,};'
        },
    );
```
* 第二步，使用routes

```javascript
koa.use(swaggerExtra.getRoutes());
```
* 第三步，运行koa工程

此时可以通过ip:port/swagger文件名来访问swagger并可以通过swagger来访问接口。

#### 注意

* isAutoFixControllersOpen 为false时，不会自动创建controller文件
* isSwaggerOpen 为false时，swagger不可访问。