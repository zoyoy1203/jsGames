
//画笔画布的导入
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var game = {
    canvas : document.getElementById('canvas'),
    ctx : canvas.getContext('2d'),

    clientWidth:  document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
    launcher: new Image(),
    gameOver: new Image(),
  
    actions: {},  // 存放各个 name:定时器id值   键值对
    launcher_x: document.documentElement.clientWidth/2 - 50/2,
    launcher_y : document.documentElement.clientHeight-60,

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
        this.draw();
        this.sounds();
        this.canvas.addEventListener('mousedown',this.mouseDown,true);//监听鼠标按下
        this.canvas.addEventListener('mousemove',this.mouseMove,false);//监听鼠标移动
        this.canvas.addEventListener('touchstart',this.mouseDown,true);// 移动端触摸开始
        this.canvas.addEventListener('touchmove',this.touchMove,true); // 移动端触摸移动

    },

    // 音效
    sounds: function() {
        var audioBall = new Audio();
        audioBall.src="./sounds/ball.mp3";

        audioBall.ontimeupdate=function(){
            if(audioBall.currentTime>=0.1){
                audioBall.pause();
            }
        };

        var audioBallState = setInterval(function(){
            audioBall.currentTime = 0;
            audioBall.play();
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
        clearInterval(this.actions[name]); // 停止定时器
        this.draw();
    },

     // 刷新绘制界面
    draw: function () {
        this.ctx.clearRect(0, 0,this.clientWidth,this.clientHeight);  // 清空给定矩形内的指定像素
        this.ctx.save();                     // 保存当前状态

        // 循环绘制小球
        for(var i=game.ball.balls.length-1; i>=0; i--){
            game.ball.balls[i].draw();
        }

        // 循环绘制砖块数组
        for(var t=game.brick.bricks.length-1; t>=0; t--){
            for(var j=0;j<8;j++){
                game.brick.bricks[t][j].draw();

                   // 发射器碰撞到砖块 游戏结束
                if(game.brick.bricks[t][j].x>game.launcher_x+5 && game.brick.bricks[t][j].x<game.launcher_x+45
                    && game.brick.bricks[t][j].y>game.launcher_y && game.brick.bricks[t][j].y<game.launcher_y+50
                    && game.brick.bricks[t][j].num>0){
                    
                    this.canvas.removeEventListener('mousemove',this.mouseMove,false);//监听鼠标移动
                    this.canvas.removeEventListener('touchmove',this.touchMove,true); // 移动端触摸移动

                    clearInterval(game.actions['addBalls']); // 停止定时器
                    clearInterval(game.actions['removeBalls']); // 停止定时器
                    clearInterval(game.actions['drawBalls']); // 停止定时器
                    clearInterval(game.actions['moveBalls']); // 停止定时器
        
                    clearInterval(game.actions['addBricks']); // 停止定时器
                    clearInterval(game.actions['removeBricks']); // 停止定时器
                    clearInterval(game.actions['drawBricks']); // 停止定时器
                    clearInterval(game.actions['moveBricks']); // 停止定时器

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


    // 鼠标触摸点击开始事件
    mouseDown: function(e) {
        var px = (e.offsetX || (e.clientX - game.canvas.offsetLeft) ||  e.touches[0].pageX);  // 点击的x坐标
        var py = (e.offsetY || (e.clientY - game.canvas.offsetTop) || e.touches[0].pageY);  // 点击的Y坐标
        var x = px-50/2;
        game.launcher_x = x;
        game.draw(); 

        if(!game.gameFlag && px > ((game.canvas.width-200)/2) && px < ((game.canvas.width-200)/2+200)
            && py > ((game.canvas.height-150)/2) && ((game.canvas.height-150)/2)+1500){
            game.ball.balls = []
            game.brick.bricks = []
            game.start();
        }
    },
    // 鼠标移动事件
    mouseMove: function(e) {
        var px = (e.offsetX || (e.clientX - game.canvas.offsetLeft));  // 点击的x坐标
        // console.log(px)
        var x = px-50/2;
        game.launcher_x = x;
        game.draw(); 
    },
    // 移动端触摸开始
    touchStart: function(e) {
        var px = e.touches[0].pageX
        // console.log(px)
        var x = px-50/2;
        game.launcher_x = x;
        game.draw(); 
    },
    // 移动端触摸移动
    touchMove: function(e) {
        var px = e.touches[0].pageX
        // console.log(px)
        var x = px-50/2;
        game.launcher_x = x;
        game.draw(); 
    },

    // 随机获取0-max之间的整数值
    getRandom: function (max) {
        return parseInt(Math.random()*max);
    },

    Intersect: function(rectA,rectB) {
        return !(rectB.y+rectB.height < rectA.y || rectB.y > rectA.x +rectA.width ||
        rectB.y > rectA.y + rectA.height|| rectB.x+rectB.width < rectA.x)
    },

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
    launcher_speed: 10,
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
            
            console.log(game.launcher_x)
            console.log(game.launcher_y)
            ctx.drawImage(game.launcher, game.launcher_x,game.launcher_y);
        }
        ctx.drawImage(game.launcher, game.launcher_x,game.launcher_y);
       
    }
}

// 绘制小球
game.ball = {
    balls: [],

    // 小球添加移除绘制
    init: function () {
        var that = this;
        game.play('moveBalls',function() {
            // console.log('moveBalls-------')
            for(var i=game.ball.balls.length-1; i>=0; i--){
                game.ball.balls[i].move();
            }
        },10)

        game.play('addBalls',function(){
            // console.log(that.balls);
            // console.log('添加------------')
            // console.log(that.balls)
            that.balls.push(new Ball(game.launcher_x+25, game.launcher_y+20, "white")); // 创建气泡并放入bubbles数组
        },500)

        game.play('removeBalls',function(){
           for(var i=that.balls.length-1; i>=0; i--){
               if(that.balls[i].y<0){
                //    console.log('移除------------')
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
    this.y -=5;
    // this.draw();//每次运动之后就要进入画的的下一帧
}
// 绘制小球
Ball.prototype.draw = function () {
    
    var ctx = game.ctx;
    // ctx.save();  //保存当前的绘图状态。
    ctx.beginPath();  // 开始绘画

    // ctx.strokeStyle = this.color; // 设置笔触颜色
    // //创建放射状/圆形渐变对象。             渐变开始圆x坐标   y坐标    半径  结束圆x坐标 y坐标  半径   
    // var gradient = ctx.createRadialGradient(this.x - 5, this.y - 5, 0, this.x, this.y, this.width);
    // gradient.addColorStop(0, "white"); // 规定 gradient 对象中的颜色和位置。
    // gradient.addColorStop(1, this.color);
    // ctx.fillStyle = gradient; // 设置填充绘图的渐变对象
    // ctx.arc(this.x, this.y, 11, 0, Math.PI * 2); // 创建圆形：圆心x坐标，圆心y坐标，圆半径，开始角，结束角

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y,this.width, 0, Math.PI * 2); 

    ctx.fill();  //内部填充
    ctx.stroke(); //轮廓绘制
    // ctx.restore();  // 恢复之前保存的绘图状态
};


// 绘制砖块群
game.brick = {
    bricks: [],
    nums: [0,0,1,3,5,8],
    colors: ['rgba(255,255,255,0)','rgba(255,255,255,0)','#FDD835','green','orange','red'],
    init: function(){
        var brick_width = game.canvas.width/8;
        var brick_height = game.canvas.height/20;
        console.log(brick_width);
        console.log(brick_height);

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
                // console.log(game.getRandom(4))
                // console.log(this.nums[game.getRandom(4)])
                var index=game.getRandom(6)
                bricks_j.push(new Bricks(brick_width*i,-40,brick_width,brick_height,that.colors[index],that.nums[index]));
            }
            that.bricks.push(bricks_j);
            bricks_j=[]
            // console.log("添加一行--------");
            // console.log(that.bricks);
        },5000)

        game.play('removeBricks',function(){
            // console.log(game.canvas.height)
            for(var i=that.bricks.length-1;i>=0;i--){
                if(that.bricks[i][0].y>game.canvas.height+30){
                    that.bricks.splice(i,1);
                    // console.log("删除一行--------");
                    // console.log(that.bricks);
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
    // this.draw();//每次运动之后就要进入画的的下一帧
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

game.over = {
    draw() {
        var ctx = game.ctx;
        ctx.font = "20px 微软雅黑";  //设置字体
        ctx.fillStyle = "#fff";  // 设置字体颜色
        console.log(game.canvas.width)
        console.log(this.x)
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