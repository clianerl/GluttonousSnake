var mapping = {}, cache = {};
var audioName = ["1","2","3","4","5"];
void function(global){
	global.define = function(id, func){
		mapping[id] = func;
	};
	global.require = function(id){
		if(cache[id])
			return cache[id];
		else
			return cache[id] = mapping[id]({});
	};
	global.startModule = function(m){
		require(m).start();
	};
	global.start = function(){
		startModule("main");
	};
	global.initButton = function(){
		if(window.attachEvent){
	    	document.getElementById("button").attachEvent('onclick',start);           
		}else{    
     		document.getElementById("button").addEventListener('onclick',start,false);
		}
	};
	global.initAudio = function(){
		for(var i=0;i<audioName.length;i++){
			void function(){
				var r =i;
				var audio = document.createElement("AUDIO");
				audio.setAttribute("id","audio_"+audioName[r]);

				var sourceOgg = document.createElement("source");
				sourceOgg.setAttribute("src","audio/"+audioName[r]+".ogg");
				sourceOgg.setAttribute("type","audio/ogg")


				var sourceWav = document.createElement("source");
				sourceWav.setAttribute("src","audio/"+audioName[r]+".wav");
				sourceWav.setAttribute("type","audio/wav")

				var sourceMp3 = document.createElement("source");
				sourceMp3.setAttribute("src","audio/"+audioName[r]+".mp3");
				sourceMp3.setAttribute("type","audio/mp3")

				audio.appendChild(sourceOgg);
				audio.appendChild(sourceMp3);
				audio.appendChild(sourceWav);

				document.body.appendChild(audio);
			}(i);
		}
	}
}(this);

define("tool",function(exports){

	exports.getRandomNum = function(max){ //获取一个1到(max)范围之间的随机数
		var randomNum = Math.random()*max;
		randomNum = Math.ceil(randomNum);//取下限
		return randomNum;
	};
	exports.showPort = function(id,className){
		document.getElementById(id).setAttribute('class',className);
	};
	exports.get = function(elementId){
		return document.getElementById(elementId);
	}

	return exports;
})

define("init",function(exports){
	var height = 500;//贪吃蛇界面高度 px
	var width = 500;//贪吃蛇界面宽度 px
	var rowNum = 20;//行数
	var colNum= 20;//列数
	var startX = 10;//开始时蛇头x坐标
	var startY = 10;//开始时蛇头x坐标
	var deflength = 5;//蛇的初始长度
	var foodLength = 20;//食物数量
	var directionSet = {left:0,right:1,up:2,down:3};//初始化方向
	var tool = require("tool");
	exports.paintWorld = function(){
		tool.get("nav").style.display="none";
		tool.get("startdiv").style.display="none";
		tool.get("world").style.display="block";
		tool.get("demo").setAttribute("class","demoposition");
		document.getElementsByTagName('body')[0].style.height = window.innerHeight+'px';  
		var world = document.getElementById("world");
		world.style.height=height+"px";
		world.style.width=width+"px";
		var table = document.createElement("table");
		for(var i = 0;i < colNum;i++){
			var col = document.createElement("tr");
			for(var j = 0;j < rowNum;j++){
				var row = document.createElement("td");
				row.id=(i+1)+"-"+(j+1);//给每个td添加一个坐标id，格式：x－y
				col.appendChild(row);
				
			}
			table.appendChild(col);
		}
		world.appendChild(table);
		world.style.marginLeft="-"+(width/2)+"px";
		world.style.marginTop="-"+(height/2)+"px";
	};
	exports.paintStartUI = function(){
		tool.get("nav").style.display="block";
		tool.get("startdiv").style.display="block";
		tool.get("world").innerHTML = "";
		tool.get("world").style.display="none";
		tool.get("demo").setAttribute("class","demo");
		
		
	}

	exports.getRowNum = function(){
		return rowNum;
	};
	exports.getColNum = function(){
		return colNum;
	};
	exports.getStartX = function(){
		return startX;
	};
	exports.getStartY = function(){
		return startY;
	};
	exports.getDefLength = function(){
		return deflength;
	};
	exports.getDirectionSet = function(){
		return directionSet;
	};
	exports.getFoodLength = function(){
		return foodLength;
	};
	return exports;
});



define("snake",function(exports){
	var init = require("init");
	var tool = require("tool");
	var snakeBody = new Array();
	var snakeLength;
	var tail;//尾巴指针指向最后一个

	exports.initSnake = function(){
		//初始化长度
		snakeLength = init.getDefLength();
		//清空数组
		snakeBody =[];
		//初始化蛇
		var x = init.getStartX();
		var y = init.getStartY();
		var startPort = x+"-"+y;
		snakeBody.push(startPort);
		for(var i = 0;i<snakeLength-1;i++){
			var port = x+"-"+(++y);
			snakeBody.push(port);
		}
		tail = snakeLength-1;

		for(var i=0;i<snakeBody.length;i++){
			void function(i){
				var n = i;
				//判断是否超出边界或者撞到自己
				//****Todo
				tool.showPort(snakeBody[n],'snake');
			}(i);	
		}
	}
	exports.move = function(newHeadPort){
		//把原来尾巴的位置，变回正常
		tool.showPort(snakeBody[tail],'');
		//把新的头放入原来的尾巴位置,并显示
		snakeBody[tail] = newHeadPort;
		tool.showPort(newHeadPort,'snake');
		//尾巴指针向前移动一个，如果索引为负，则指向最后一个索引
		tail--;
		if(tail<0){
			tail = snakeLength-1;
		}
	};
	exports.eat = function(atePort){
		snakeLength++;
		snakeBody.splice((tail+1), 0, atePort);
		tool.showPort(atePort,'snake');
	};
	exports.getSnakeBody = function(){
		return snakeBody;
	}
	exports.getSnakeLength = function(){
		return snakeLength;
	}
	exports.getTail = function(){
		return tail;
	}
	return exports;
});

define("food",function(exports){
	var tool = require("tool");
	var init = require("init");
	var snake = require("snake");
	var rowNum = init.getRowNum();
	var colNum = init.getColNum();
	var foodSet = new Array();
	var snakeBody;

	function randomFood(){
		while(1){
			x = tool.getRandomNum(rowNum);	
			y = tool.getRandomNum(colNum);
			var  foodPort= x+"-"+y;
			if(foodSet.length!=0 && (foodSet.indexOf(foodPort)!=-1 || snakeBody.indexOf(foodPort)!=-1) ){
				continue;//如果随机的点是已经存在的，则重新生成
			}	
			return foodPort;
		}
	}
	exports.initFood = function(){
		snakeBody = snake.getSnakeBody();
		var foodLength = init.getFoodLength();
		//初始化清空数组
		foodSet =[];
		for(var i=0;i<foodLength;i++){
			foodPort = randomFood();
			tool.showPort(foodPort,'food');
			foodSet.push(foodPort);
		}
		foodSetSave = foodSet;
	};
	exports.reduceAndAddFood = function(port){
		var i = foodSet.indexOf(port);
		var foodPort = randomFood();
		foodSet[i]=foodPort;
		tool.showPort(foodPort,'food');
	};
	exports.getFoodSet = function(){
		return foodSet;
	};
	return exports;
})

define("action",function(exports){
	var init = require("init");
	var snake = require("snake");
	var food = require("food");
	var tool = require("tool");
	var directionSet = init.getDirectionSet();
	var direction; 
	var interval;
	var flag;//	是否可以修改方向的标示

	exports.initDirection = function(){
		direction = directionSet.left;	
	};
	exports.action = function(){
		//判断方向
		var snakeLength = snake.getSnakeLength();
		var snakeBody = snake.getSnakeBody();
		var foodSet = food.getFoodSet();
		var tail = snake.getTail();
		var head = (tail+1)%snakeLength;//得到头的索引
		//解析头，分离出x和y
		var headPort = snakeBody[head].split("-");
		var headX = headPort[0];
		var headY = headPort[1];
		//根据方向推算下一个头的位置
		switch(direction){
			case directionSet.left  : headY--;break;
			case directionSet.right : headY++;break;
			case directionSet.up    : headX--;break; 
			case directionSet.down  : headX++;break;
		}
		var newHeadPort = headX+"-"+headY;
		//设置可以修改方向
		flag=true;

		//1）如果超出表格
		if(!document.getElementById(newHeadPort)){			
			window.clearInterval(interval);
			alert("game over!");
			init.paintStartUI();
			return false;
		}
		//2）如果是吃，则调用snake的eat，参数是吃掉的点
		else if(foodSet.indexOf(newHeadPort)!=-1){
			snake.eat(newHeadPort);
			//随机播放一个音频文件
			var r = tool.getRandomNum(audioName.length)-1;
			document.getElementById("audio_"+audioName[r]).play();
			food.reduceAndAddFood(newHeadPort);

		}
		//3）如果是撞到了自己，gameover
		else if(snakeBody.indexOf(newHeadPort)!=-1){
			window.clearInterval(interval);
			alert("game over!");
			init.paintStartUI();
			return false;
		}
		//4）如果是正常前进，则调用snake的move，参数是新的头
		else 
			snake.move(newHeadPort);
	};
	exports.start = function(){
		init.paintWorld();
		snake.initSnake();
		food.initFood();
		this.initDirection();
		addListener();
		var interval = setInterval("require('action').action()",250);
		require('action').setInterval(interval);
	};
	
	exports.getDirection = function(){
		return direction;
	};
	exports.setDirection = function(newDirection){
		direction = newDirection;
	};
	exports.setInterval = function(i){
		interval = i;
	};
	exports.setFlag = function(newFlag){
		flag = newFlag;
	};
	exports.getFlag = function(){
		return flag;
	}
	return exports;
})



define("main",function(exports){
	exports.start = function(){
		startModule("action");
	};
	return exports;
} );

function addListener(){
	document.onkeydown=function(event){
		var action = require('action');
		var init = require("init");
		var direction = action.getDirection();
		var directionSet = init.getDirectionSet();
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var flag = action.getFlag();
       	if(e && e.keyCode==37 && flag){ // 按 左键 
        	if(direction!=directionSet.right) action.setDirection(directionSet.left);
        	action.setFlag(false);
        }
        if(e && e.keyCode==38 && flag){ // 按 上键
            if(direction!=directionSet.down) action.setDirection(directionSet.up);
            action.setFlag(false);
        }            
        if(e && e.keyCode==39 && flag){ // 按 右键
            if(direction!=directionSet.left) action.setDirection(directionSet.right);
            action.setFlag(false);
        }
        if(e && e.keyCode==40 && flag){ // 按 下键
        	if(direction!=directionSet.up) action.setDirection(directionSet.down);
        	action.setFlag(false);
        }
    }; 
}

initAudio();
initButton();

