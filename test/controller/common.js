
function Common() {

}

//############interface area###############
/**
 * @method post
 * @summary 登录
 * @description code必选；encryptedData，iv授权之后传
 * @requestParam code 
 * @requestParam encryptedData 
 * @requestParam iv 
 *  */
Common.prototype.login = async function (ctx, next){
	const paramsBody = ctx.request.body,
		code = paramsBody.code,
		encryptedData = paramsBody.encryptedData,
		iv = paramsBody.iv;
	ctx.body = { code: 200 };
}

/**
 * @method post
 * @summary 登录2
 * @description code必选；encryptedData，iv授权之后传2
 * @requestParam code2 
 * @requestParam encryptedData2 
 * @requestParam iv2 
 *  */
Common.prototype.login2 = async function (ctx, next){
	const paramsBody = ctx.request.body,
		code2 = paramsBody.code2,
		encryptedData2 = paramsBody.encryptedData2,
		iv2 = paramsBody.iv2;
	ctx.body = { code: 200 };
}

//############interface area###############

module.exports = new Common();
