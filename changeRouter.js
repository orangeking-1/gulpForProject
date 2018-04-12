var fs = require('fs')
var rimraf = require('rimraf');

//处理router里面js对应链接地址
fs.readFile('./mappingJs.json', 'utf-8', function(err, data){              //读取js映射表
	if (err) throw err;
    var jsMapObj = JSON.parse(data);
    var routerPath = jsMapObj["router.js"];
    var routerText = "";
    fs.readFile(`./dist/js/controller/router/${routerPath}`, 'utf-8', function(err, dataStr){              //读取构建后的router文件
        dataStr = dataStr.replace(/.\/es5JS\//, './')

    	if (err) throw err
    	for(key in jsMapObj){
        	var Exp = new RegExp('\/'+ key, "g")
    		dataStr = dataStr.replace(Exp, '/' + jsMapObj[key])
            Exp = null
    	}


        //处理router里面css对应的链接
        fs.readFile('./mappingCss.json', 'utf-8', function (err, data) {
            if(err) throw err;
            var cssMapObj = JSON.parse(data);
            for(cssKey in cssMapObj){
				var cssExp = new RegExp('\/'+ cssKey, "g")
                dataStr = dataStr.replace(cssExp, '/' + cssMapObj[cssKey])
                cssExp = null
			}


			//处理router里面的html对应的链接
            fs.readFile('./mappingHtml.json', 'utf-8', function (err, data) {
                if(err) throw err;
                var htmlMapObj = JSON.parse(data);
                for(htmlKey in htmlMapObj){
                    //替换掉routerJs里面html的引用
                    var htmlExp = new RegExp('\/'+ htmlKey, "g")
                    dataStr = dataStr.replace(htmlExp, "/" + htmlMapObj[htmlKey])
                    htmlExp = null

                }


                //重新写入router文件
                fs.writeFile(`./dist/js/controller/router/${routerPath}`, dataStr, function(err){
                    if (err) throw err;
                    console.log("router.js文件应用路径修改成功");
                });



            })




        })



    
    });
    
});


//删除viewTemp文件夹
rimraf('./dist/viewTemp', function (err) {
    if(err) throw err
    console.log("viewTemp文件夹删除成功") 
});

//修改index.html中的es5JS引用
fs.readFile('./dist/index.html', 'utf-8', function (err, data) {
    if(err) throw err;
    data = data.replace(/.\/es5JS\//g, './')
    fs.writeFile('./dist/index.html', data, function (err) {
        if (err) throw err;
        console.log("修改index.html中的es5JS引用成功")
    })
})








