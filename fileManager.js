/**
 * 文件管理工具
 * 通过浏览器可以查看服务器上目录和文件
 */

'use strict';

//模版文件
const TEMPLATE_FILE = "fileManager.html";

//引用模块
var fsObj   = require('fs'),
    pathObj = require('path'),
    urlObj  = require('url'),
    httpObj = require('http');

//启动服务器
var server = httpObj.createServer(function (request, response) {
	
	//解析请求参数
	var urlInfo = urlObj.parse(request.url);
	var params = parseQuery(urlInfo.query);
	console.info(params);

	//根据参数分发
	if (params["path"]) {
		//有参数时显示目录下文件
		response.writeHead(200, {"Content-Type" : "text/html"});
		response.end(JSON.stringify({
			"dir"   : params["path"],
			"files" : listFiles(params["path"])
		}));		
	} else {
		//无参数时显示初始画面
		fsObj.stat(TEMPLATE_FILE, (error, stats) => {
			if (!error && stats.isFile()) {
				response.writeHead(200, {"Content-Type" : "text/html"});
				fsObj.createReadStream(TEMPLATE_FILE).pipe(response);
			} else {
				response.writeHead(404);
				response.end("404 Not Found");
			}
		});
	}
});

/**
 * 列出指定目录下全部文件和子目录
 * @param dir 要查找的目录
 * return [{
 *     name     : 文件名,
 *     fullname : 文件全路径,
 *     isFile   : 是否为文件	
 * }, ...]
 */
var listFiles = function (dir) {
	var files = [];
	fsObj.readdirSync(dir).forEach(function(elment, index, array) {
			files.push({
				"name" : elment,
				"fullname" : pathObj.join(dir, elment),
				"isFile" : fsObj.statSync(pathObj.join(dir, elment)).isFile()
			});			
		})	
	files.unshift({
				"name" : "..",
				"fullname" : pathObj.join(dir, ".."),
				"isFile" : false
			});
	return files;
}

/**
 * 解析请求参数，解析结果放入对象 { 参数名 : 参数值 , ... }
 * @param query 用url解析出的query字符串
 */
var parseQuery = function (query) {
	var result = {};
	if (query) {
		query.split("&").forEach(function(element, index, array){
			var pair = element.split("=");
			if (pair[0]) {
				result[pair[0]] = pair[1];
			}
		});	
	}
	return result;
}

server.listen(8000);
