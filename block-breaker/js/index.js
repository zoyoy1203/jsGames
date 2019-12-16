
var game = {
    canvas : document.getElementById('canvas'),
    ctx : canvas.getContext('2d'),

    clientWidth:  document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
    launcher: new Image(),
    gameOver: new Image(),
    addSpeed: new Image(),
    addPower: new Image(),
  
    actions: {},  // 存放各个 name:定时器id值   键值对
    launcher_x: document.documentElement.clientWidth/2 - 50/2,
    launcher_y : document.documentElement.clientHeight-60,

    audioBallState: null,
    audioBall : new Audio(),

    gameFlag: false,

    init: function() {
        //根据可视区域大小，判断canvas大小 和 发射器位置
        if(this.clientWidth>900){
            this.canvas.width = 375; // 可见区域宽度
            this.canvas.height = 667; // 可见区域高度
            this.launcher_y = this.canvas.height - 60;
            this.launcher_x =  this.canvas.width/2 - 50/2;
        }else{
            this.canvas.width = this.clientWidth; // 可见区域宽度
            this.canvas.height = this.clientHeight; // 可见区域高度    
        }
     
        // 游戏图片的导入
        // 发射器图片
        this.launcher.src = "./image/launcher.png";

        //游戏结束
        this.gameOver.src = "./image/game_over.png";

  
    },

    start: function() {
        this.gameFlag = true;
        this.init();
        game.ball.init();
        game.brick.init(); // 砖块群初始化
        game.tool.init();
        this.draw();
        this.sounds();
        this.canvas.addEventListener('mousedown',this.mouse_touch_Down);//监听鼠标按下
        this.canvas.addEventListener('mousemove',this.mouse_touch_Move);//监听鼠标移动
        this.canvas.addEventListener('touchstart',this.mouse_touch_Down);// 移动端触摸开始
        this.canvas.addEventListener('touchmove',this.mouse_touch_Move); // 移动端触摸移动

    },

    // 音效
    sounds: function() {
        game.audioBall.src="./sounds/ball.mp3";

        game.audioBall.ontimeupdate=function(){
            if(game.audioBall.currentTime>=0.1){
                game.audioBall.pause();
            }
        };

        game.audioBallState = setInterval(function(){
            game.audioBall.currentTime = 0;
            game.audioBall.play();
        },1000);
    },

    // 创建定时器
    play: function (name, action, interval) {
        var that = this;
        this.actions[name] = setInterval(function () {
            action();
            that.draw();     // 刷新重绘界面
        }, interval || 50);
    },

    // 停止actions中键名为name的定时器
    stop: function (name) {
        clearInterval(game.actions[name]); // 停止定时器
    },

     // 刷新绘制界面
    draw: function () {
        this.ctx.clearRect(0, 0,this.clientWidth,this.clientHeight);  // 清空给定矩形内的指定像素
        this.ctx.save();                     // 保存当前状态

        // 循环绘制小球
        for(var i=game.ball.balls.length-1; i>=0; i--){
            game.ball.balls[i].draw();
        }

        // console.log(game.tool.tools)
        // 循环绘制道具
        for(var i=game.tool.tools.length-1; i>=0; i--){
            game.tool.tools[i].draw();

            if(game.tool.tools[i].remove){
                game.tool.tools.splice(i,1);
            }
          
        }


        // 循环绘制砖块数组
        for(var t=game.brick.bricks.length-1; t>=0; t--){
            for(var j=0;j<8;j++){
                game.brick.bricks[t][j].draw();

                   // 发射器碰撞到砖块 游戏结束
                if(game.brick.bricks[t][j].x>game.launcher_x+5 && game.brick.bricks[t][j].x<game.launcher_x+45
                    && game.brick.bricks[t][j].y>game.launcher_y && game.brick.bricks[t][j].y<game.launcher_y+50
                    && game.brick.bricks[t][j].num>0){
                    
                    this.canvas.removeEventListener('mousemove',this.mouse_touch_Move);//监听鼠标移动
                    this.canvas.removeEventListener('touchmove',this.mouse_touch_Move); // 移动端触摸移动

                    // 停止定时器
                    game.stop('addBalls')
                    game.stop('removeBalls')
                    game.stop('drawBalls')
                    game.stop('moveBalls')

                    game.stop('addBricks')
                    game.stop('removeBricks')
                    game.stop('drawBricks')
                    game.stop('moveBricks')

                    game.stop('addTools')
                    game.stop('removeTools')
                    game.stop('drawTools')
                    game.stop('moveTools')

                    clearInterval(game.audioBallState);  // 停止射击音效
                    game.audioBall.pause();


                    game.over.draw();
                    game.gameFlag = false;

                    console.log("结束")
            
                }
                
                // 循环小球数组
                for(var b=game.ball.balls.length-1; b>=0;b--){
                    //  小球碰撞到有效砖块
                    if(game.ball.balls[b].y<(game.brick.bricks[t][j].y+game.brick.bricks[t][j].height) && game.ball.balls[b].y>game.brick.bricks[t][j].y
                        && game.ball.balls[b].x>game.brick.bricks[t][j].x && game.ball.balls[b].x<game.brick.bricks[t][j].x+game.brick.bricks[t][j].width
                        && game.brick.bricks[t][j].num >0){
                        // console.log("碰撞了");
                        var brick_num = game.brick.bricks[t][j].num
                        game.ball.balls.splice(b,1);
                        // 砖块剩余分数计算，游戏总分计算
                        if((brick_num-game.score.launcher_power)>0){
                            game.brick.bricks[t][j].num -= game.score.launcher_power;
                            game.score.score_sum += game.score.launcher_power;
                        }else{ // 砖块消灭
                            game.brickOver(game.brick.bricks[t][j].x,game.brick.bricks[t][j].y);
                            game.score.score_sum += brick_num;
                            game.brick.bricks[t][j].num -= game.score.launcher_power;
                        }
                    }

                }


            }
        }
       
        game.shoot.draw();                   // 绘制发射器
        game.score.draw();                   // 绘制初始化分数
        this.ctx.restore();                  // 恢复之前保存的绘图状态

    },


    // 鼠标 触摸 开始事件
    mouse_touch_Down: function(e) {
        var px = (e.offsetX || (e.clientX - game.canvas.offsetLeft) ||  e.touches[0].pageX);  // 点击的x坐标
        var py = (e.offsetY || (e.clientY - game.canvas.offsetTop) || e.touches[0].pageY);  // 点击的Y坐标
        var x = px-50/2;
        // console.log(game.gameFlag)
        if(game.gameFlag){
            game.launcher_x = x;
        }else{
            if(px > ((game.canvas.width-200)/2) && px < ((game.canvas.width-200)/2+200)
                && py > ((game.canvas.height-150)/2) && py<((game.canvas.height-150)/2)+150){
                // console.log((game.canvas.height-150)/2)
                // console.log(((game.canvas.height-150)/2)+150)
                game.ball.balls = []
                game.brick.bricks = []
                game.start();
            }
        }
       
        game.draw(); 
    },
    // 鼠标 触摸 移动事件
    mouse_touch_Move: function(e) {
        var px = (e.offsetX || (e.clientX - game.canvas.offsetLeft) || e.touches[0].pageX);  // 点击的x坐标
        // console.log(px)
        var x = px-50/2;
        game.launcher_x = x;
        game.draw(); 
    },

    // 随机获取0-max之间的整数值
    getRandom: function (max) {
        return parseInt(Math.random()*max);
    },

    // 绘制砖块销毁特效动画
    brickOver: function(x,y){
        var ctx = game.ctx;
        var agle=0;

        ctx.save();
        ctx.translate(x,y)
        ctx.clearRect(-game.canvas.width/2,-game.canvas.height/2,game.canvas.width,game.canvas.height);
        
        
        for(var i=0;i<=100;i+=parseInt(Math.random()*30)){
            for(var j =0;j<=100;j+=parseInt(Math.random()*30)){
                // ctx.clearRect(0,0,800,600);
                agle = parseInt(Math.random()*360)
                ctx.rotate(agle*Math.PI/180);
                ctx.fillRect(i,j,10,10);
                ctx.fill();
                ctx.rotate(-agle*Math.PI/180);
            }
        }

        ctx.restore();

    }
    
}

// 游戏分数的计算和绘制
game.score = {
    launcher_speed: 5,
    launcher_power: 1,
    score_sum: 0,
    draw: function () {
        var ctx = game.ctx;
        ctx.save();  //保存当前的绘图状态。
        ctx.translate(10, 10); //重新映射画布上的 (0,0) 位置。
        // ctx.clearRect(0, 0, 90, 100); //清空给定矩形内的指定像素。
        ctx.font = "14px 微软雅黑";  //设置字体
        ctx.fillStyle = "#fff";  // 设置字体颜色
        //在画布上绘制填色的文本
        ctx.fillText("攻速:" + this.launcher_speed,0, 30);
        ctx.fillText("威力:" + this.launcher_power, 0, 60);
        ctx.fillText("得分:" + this.score_sum,0,90);
        ctx.fill();
        ctx.stroke();   // 开始绘制
        ctx.restore();  // 恢复之前保存的绘图状态
    },
    addScore: function (num) {
        this.launcher_speed += num;
        this.draw();
    },
};

// 游戏发射器的绘制
game.shoot = {
    draw: function() {
        var ctx = game.ctx;
        //  判断图片是否加载完，加载完后再绘制，不然显示不出来。
        game.launcher.onload =function() {
            ctx.drawImage(game.launcher, game.launcher_x,game.launcher_y);
        }
        ctx.drawImage(game.launcher, game.launcher_x,game.launcher_y);
    }
}

// 游戏道具图片的绘制
game.tool = {
    tools: [],
      // 小球添加移除绘制
    init: function () {
        var that = this;
        game.play('moveTools',function() {
            for(var i=game.tool.tools.length-1; i>=0; i--){
                game.tool.tools[i].move();
            }
        },40)

        game.play('addTools',function(){
            that.tools.push(new Tool(game.getRandom(2),game.getRandom(300),30)); // 创建气泡并放入bubbles数组
        },5000)

        game.play('removeTools',function(){
            for(var i=that.tools.length-1; i>=0; i--){
                if(that.tools[i].y>680){
                    that.tools.splice(i,1);
                }
            }
        },100)
    }
}

var Tool = function(img_i,x,y){
    this.i = img_i;
    this.x = x;
    this.y = y;
    this.remove = false;
}
Tool.prototype.move = function() {
    this.y += 3;
    // 碰撞检测
    if(this.y>500 && game.launcher_x>this.x && game.launcher_x<this.x+50
        && game.launcher_y >this.y && game.launcher_y<this.y+60){
        console.log("吃到工具")
        if(this.img_i == 0){
            game.score.launcher_power +=1;
        }else{
            game.score.launcher_speed +=2;
        }
        this.remove = true;
    }
}
Tool.prototype.draw = function() {
    var ctx = game.ctx;
    ctx.beginPath();  // 开始绘画
    if(this.i==0){   // 加威力
        ctx.fillStyle = "#FF0000";
    }else{ // 加攻速
        ctx.fillStyle = "#00BFFF";
    }
    ctx.arc(this.x, this.y,10, 0, Math.PI * 2); 
    ctx.fill();  //内部填充
}

// 绘制小球
game.ball = {
    balls: [],

    // 小球添加移除绘制
    init: function () {
        var that = this;
        game.play('moveBalls',function() {
            for(var i=game.ball.balls.length-1; i>=0; i--){
                game.ball.balls[i].move();
            }
        },50/game.score.launcher_speed)

        game.play('addBalls',function(){
            that.balls.push(new Ball(game.launcher_x+25, game.launcher_y+20, "white")); // 创建气泡并放入bubbles数组
        },1000/game.score.launcher_speed)

        game.play('removeBalls',function(){
           for(var i=that.balls.length-1; i>=0; i--){
               if(that.balls[i].y<0){
                    that.balls.splice(i,1);
               }
           }
        },20)

      
    },
    
}
// 发射的小球
var Ball = function (x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = 10;  // 圆半径
    this.height = 10;
};
// 小球移动
Ball.prototype.move = function() {
    this.y -= 5
}
// 绘制小球
Ball.prototype.draw = function () {
    
    var ctx = game.ctx;
    ctx.beginPath();  // 开始绘画
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y,this.width, 0, Math.PI * 2); 
    ctx.fill();  //内部填充
    ctx.stroke(); //轮廓绘制
 
};


// 绘制砖块群
game.brick = {
    bricks: [],
    nums: [0,0,1,3,5,8],
    colors: ['rgba(255,255,255,0)','rgba(255,255,255,0)','#FDD835','green','orange','red'],
    init: function(){
        var brick_width = game.canvas.width/8;
        var brick_height = game.canvas.height/20;
        var that = this;
        game.play('moveBricks',function() {
            // 循环砖块数组
            for(var t=game.brick.bricks.length-1; t>=0; t--){
                for(var j=0;j<8;j++){
                    game.brick.bricks[t][j].move();                 
                }
            }

        },40)

        game.play('addBricks',function(){
            var bricks_j=[];
            for(let i=0; i<8;i++){
                var index=game.getRandom(6)
                bricks_j.push(new Bricks(brick_width*i,-40,brick_width,brick_height,that.colors[index],that.nums[index]));
            }
            that.bricks.push(bricks_j);
            bricks_j=[]
        },5000)

        game.play('removeBricks',function(){
            for(var i=that.bricks.length-1;i>=0;i--){
                if(that.bricks[i][0].y>game.canvas.height+30){
                    that.bricks.splice(i,1);
                }
            }
        },100)
       
    }
}
//  砖块
var Bricks = function(x,y,width,height,color,num){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.color=color;
    this.num=num;
}
// 砖块移动
Bricks.prototype.move = function() {
    this.y +=3;
}
// 绘制砖块
Bricks.prototype.draw = function () {
    var ctx = game.ctx;
    ctx.beginPath();  // 开始绘画
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.width,this.height);

    ctx.font = "20px 微软雅黑";  //设置字体
    ctx.strokeStyle = "#fff";
    if(this.num >0){
        ctx.strokeText(this.num,this.x+this.width/2-5,this.y+this.height/2+5)
    }else{
        this.color = 'rgba(255,255,255,0)';
    }

    ctx.fill();  //内部填充
    ctx.stroke(); //轮廓绘制
};

// 游戏结束面板
game.over = {
    draw() {
        var ctx = game.ctx;
        ctx.font = "20px 微软雅黑";  //设置字体
        ctx.fillStyle = "#fff";  // 设置字体颜色
        ctx.fillRect((game.canvas.width-200)/2,(game.canvas.height-150)/2,200,150);
        ctx.strokeStyle = '#000';
        ctx.strokeText("得分："+game.score.score_sum,(game.canvas.width-200)/2+60, (game.canvas.height-150)/2+40);
        ctx.strokeText("游戏结束",(game.canvas.width-200)/2+60, (game.canvas.height-150)/2+80);
        ctx.strokeText("重新开始",(game.canvas.width-200)/2+60, (game.canvas.height-150)/2+130);
        ctx.stroke();   // 开始绘制
        ctx.fill();
    }

}
game.start();