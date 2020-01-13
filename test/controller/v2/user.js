
function User() {

}

//############interface area###############
/**
 * @method get
 * @summary 小程序登录2
 * @description code必选；encryptedData，iv授权之后传2
 * @requestParam code2 
 * @requestParam encryptedData2 
 *  */
User.prototype.spLogin2 = async function (ctx, next){
	const paramsBody = ctx.params,
		code2 = paramsBody.code2,
		encryptedData2 = paramsBody.encryptedData2;
	ctx.body = {code: 200,};
}

//############interface area###############

module.exports = new User();
