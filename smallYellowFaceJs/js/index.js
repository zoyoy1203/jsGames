//获得主界面
var mainDiv=document.getElementById("maindiv");
//获得开始界面
var startdiv=document.getElementById("startdiv");
//获得左上角分数面板
var scorediv=document.getElementById("scorediv");
//获得左上角分数面板里的分数标签
var scorelabel=document.getElementById("label");
//获得暂停界面
var suspenddiv=document.getElementById("suspenddiv");
//获得游戏结束界面
var enddiv=document.getElementById("enddiv");
//获得游戏结束界面的分数标签
var score=document.getElementById("score");
//获取右上角上一首歌曲按钮
var lastMusic = document.getElementById("lastMusic");
//获取右上角下一首歌曲按钮
var nextMusic = document.getElementById("nextMusic");
// 获取audio
var music = document.getElementById("audio");
// 获取敌方小黄脸死亡声音
var dieface1 = document.getElementById("audio1");
var dieface2 = document.getElementById("audio2");
var dieface3 = document.getElementById("audio3");
var diefaceState1;
var diefaceState2;
var diefaceState3;
// 歌曲列表数组
var sounds = [
    "sound/Axero - Trip.mp3",
    "sound/that girl.mp3",
    "sound/Wicked Wonderland.mp3",
    "sound/你打不过我吧.mp3",
]

var soundsnum = sounds.length;
var soundsindex = 0;
function lastM() {
    clearInterval(musicState);
    music.pause();
    if(soundsindex == 0){
        soundsindex = soundsnum-1;
    }else{
        soundsindex --;
    }
    music.src=sounds[soundsindex];
}
function nextM() {
    clearInterval(musicState);
    music.pause();
    if(soundsindex == soundsnum-1){
        soundsindex = 0
    }else{
        soundsindex ++;
    }
    music.src=sounds[soundsindex];
}

//初始化分数
var scores=0;

// 创建小黄脸和玩家公共类
function face(hp,X,Y,sizeX,sizeY,score,dietime,speed,boomimage,imagesrc,kind){
    this.faceX = X;
    this.faceY = Y;
    this.imagenode = null;
    this.facehp = hp; // 血量
    this.facescore = score;  // 分数
    this.facesizeX = sizeX;
    this.facesizeY = sizeY;
    this.faceboomimage = boomimage; // 死亡图片
    this.faceisdie = false; // 是否死亡
    this.facedietimes = 0; // 记录死亡时间 （死了多久）
    this.facedietime = dietime;  // 规定的死亡时间
    this.facespeed = speed;  // 速度
    this.facekind = kind; // 类型   0：我方白大王，  1：小黄脸  2：中黄脸  3：大黄脸

    // 移动行为 ： 不同分数段，不同速度
    this.facemove = function() {
        if(scores<=50000){
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+"px";
        }
        else if(scores>50000&&scores<=100000){
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+1+"px";
        }
        else if(scores>100000&&scores<=150000){
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+2+"px";
        }
        else if(scores>150000&&scores<=200000){
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+3+"px";
        }
        else if(scores>200000&&scores<=300000){
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+4+"px";
        }
        else{
            this.imagenode.style.top=this.imagenode.offsetTop+this.facespeed+5+"px";
        }
    }
    // 初始化函数 
    this.init = function() {
        this.imagenode = document.createElement("img");  // 创建小黄脸img  dom元素
        this.imagenode.style.left = this.faceX + "px";  //左边距
        this.imagenode.style.top = this.faceY + "px";   //上边距
        this.imagenode.style.width = this.facesizeX + "px";
        this.imagenode.style.height = this.facesizeY + "px";
        this.imagenode.src = imagesrc;  // 设置小黄脸图片地址
        mainDiv.appendChild(this.imagenode); // 添加到主界面上
    }
    this.init(); // 执行初始化函数

}

// 创建子弹类
function bullet(X,Y,sizeX,sizeY,imagesrc){
    this.bulletX=X;
    this.bulletY=Y;
    this.bulletsizeX=sizeX;
    this.bulletsizeY=sizeY;
    this.bulletimage=null;
    this.bulletattach=1;  // 攻击力

    // 移动行为
    this.bulletmove = function() {
        this.bulletimage.style.top=this.bulletimage.offsetTop-20+"px";
    }

    this.init = function() {
        this.bulletimage=document.createElement("img");
        this.bulletimage.style.left= this.bulletX+"px";
        this.bulletimage.style.top= this.bulletY+"px";
        this.bulletimage.src=imagesrc;
        mainDiv.appendChild(this.bulletimage);
    }

    this.init();

}

// 创建单行子弹类
function oddbullet(X,Y){
    bullet.call(this,X,Y,20,20,"images/b1.png");
}

//创建敌方小黄脸类
function enemy(hp,a,b,sizeX,sizeY,score,dietime,speed,boomimage,imagesrc,kind){
    face.call(this,hp,random(a,b),-100,sizeX,sizeY,score,dietime,speed,boomimage,imagesrc,kind);
}

//产生min到max之间的随机数
function random(min,max){
    return Math.floor(min+Math.random()*(max-min));
}

// 创建我方白大王类
function ourking(X,Y){
    var imagesrc="images/k1.gif";
    //            hp,X,Y,sizeX,sizeY,score,dietime,speed,boomimage,imagesrc
    face.call(this,1,X,Y,66,80,0,660,0,"image/die3.gif",imagesrc,0);
    this.imagenode.setAttribute('id','ourking');
}

// 创建我方白大王
var selfking = new ourking(692,600);

//  创建我方dom元素
var ourking = document.getElementById("ourking");

// 移动事件
var move = function() {
    var oevent=window.event||arguments[0];
    var chufa=oevent.srcElement||oevent.target;
    var selfkingX=oevent.clientX-100;  // 鼠标x轴移动坐标
    var selfkingY=oevent.clientY;      // 鼠标y轴移动坐标
    ourking.style.left=selfkingX-selfking.facesizeX/2+"px";
    ourking.style.top=selfkingY-selfking.facesizeY/2+"px";
}
// 白大王动态效果
var ourkingImg = [
    "images/k2.gif",
    "images/k3.gif",
    "images/k4.gif",
    "images/k5.gif",
]
var num = 0;
var ourkingChange = function() {
    num ++;
    if(num == 20){
        ourking.src = ourkingImg[1];
    }else if(num == 40){
        ourking.src = ourkingImg[2];
    }else if(num == 60){
        ourking.src = ourkingImg[3];
    }else if(num == 80){
        num = 0;
    }
}


// 暂停事件
var number = 0;  // 控制暂停和开始之间的转换
var pauseG = function() {
    if(number==0){
        clearInterval(musicState);
        music.pause();
        suspenddiv.style.display="block";  // 暂停栏目显示
        if(document.removeEventListener){
            mainDiv.removeEventListener("mousemove",move,true);
            bodyobj.removeEventListener("mousemove",boundary,true);
        }
        else if(document.detachEvent){
            mainDiv.detachEvent("onmousemove",move);
            bodyobj.detachEvent("onmousemove",boundary);
        }
        clearInterval(set);
        clearInterval(ourkingC);
        number=1;
    }
    else{
        musicState = setInterval(toggleSound(music),1);
        suspenddiv.style.display="none";
        if(document.addEventListener){
            mainDiv.addEventListener("mousemove",move,true);
            bodyobj.addEventListener("mousemove",boundary,true);
        }
        else if(document.attachEvent){
            mainDiv.attachEvent("onmousemove",move);
            bodyobj.attachEvent("onmousemove",boundary);
        }
        set=setInterval(start,20);
        ourkingC = setInterval(ourkingChange,20);
        number=0;
    }
}

// 判断小白是否移出边界
var boundary = function(){
    var oevent=window.event||arguments[0];
    var bodyobjX=oevent.clientX;
    var bodyobjY=oevent.clientY;
    if(bodyobjX<100||bodyobjX>1350||bodyobjY<20||bodyobjY>720){
        if(document.removeEventListener){
            mainDiv.removeEventListener("mousemove",move,true);
        }
        else if(document.detachEvent){
            mainDiv.detachEvent("onmousemove",move);
        }
    }
    else{
        if(document.addEventListener){
            mainDiv.addEventListener("mousemove",move,true);
        }
        else if(document.attachEvent){
            mainDiv.attachEvent("nomousemove",move);
        }
    }
}

//游戏结束后点击继续按钮事件
function jixu(){
    location.reload(true);
}



var bodyobj=document.getElementsByTagName("body")[0];
if(document.addEventListener){
    //为本方白大王添加移动和暂停
    mainDiv.addEventListener("mousemove",move,true);
    //为本方白大王添加暂停事件
    selfking.imagenode.addEventListener("click",pauseG,true);
    //为body添加判断本方白大王移出边界事件
    bodyobj.addEventListener("mousemove",boundary,true);
    //为暂停界面的继续按钮添加暂停事件
    suspenddiv.getElementsByTagName("button")[0].addEventListener("click",pauseG,true);
    //为暂停界面的返回主页按钮添加事件
    suspenddiv.getElementsByTagName("button")[1].addEventListener("click",jixu,true);
}
else if(document.attachEvent){
    //为本方白大王添加移动
    mainDiv.attachEvent("onmousemove",move);
    //为本方白大王添加暂停事件
    selfking.imagenode.attachEvent("onclick",pauseG);
    //为body添加判断本方白大王移出边界事件
    bodyobj.attachEvent("onmousemove",boundary);
    //为暂停界面的继续按钮添加暂停事件
    suspenddiv.getElementsByTagName("button")[0].attachEvent("onclick",pauseG);
    //为暂停界面的返回主页按钮添加事件
    suspenddiv.getElementsByTagName("button")[1].attachEvent("click",jixu,true);
}


//初始化隐藏本方白大王
selfking.imagenode.style.display="none";

// 敌机对象数组
var enemys=[];
// 子弹对象数组
var bullets=[];
var mark=0;
var mark1=0;
var backgroundPositionY=0;

// 小黄脸类别图形数组
var faceimgS = [
    "images/f1.png",
    "images/f2.png",
    "images/f3.png",
    "images/f4.png",
    "images/f5.png",
    "images/f6.png",
    "images/f7.png",
    "images/f8.png",
    "images/f9.png",
    "images/f10.png",
    "images/f11.png",
    "images/f12.png",
    "images/f13.png",
    "images/f14.png",
    "images/f15.png",
    "images/f16.png",
    "images/f17.png",
    "images/f18.png",
    "images/f19.png",
    "images/f20.png",
    "images/f21.png",
    "images/f22.png",
]
// 中黄脸图片数组
var faceimgM = [
    "images/mf1.png",
    "images/mf2.png",
    "images/mf3.png",
    "images/mf4.png",
    "images/mf5.png",
    "images/mf6.png",
    "images/mf7.png",
    "images/mf8.png",
]
// 大黄脸图片素组
var faceimgB = [
    "images/mf9.png",
    "images/mf10.png",
    "images/mf11.png",
]
// 死亡图片数组
var boomimg = [
    "images/ddf1.png",
    "images/ddf3.png",
    "images/ddf5.png"
]

// 开始函数
function start(){
    // // 背景移动
    // mainDiv.style.backgroundPositionY=backgroundPositionY+"px";
    // backgroundPositionY+=0.5;
    // if(backgroundPositionY==568){
    //     backgroundPositionY=0;
    // }
    mark++;
  
    // 创建敌方小黄脸
    // 循环20次，创建一个黄脸。 根据循环总次数取余值，创建不同阶段的黄脸
    if(mark==20){
        mark1++;
        //中黄脸
      
        if(mark1%5==0){
            var m = random(0,7);
            //                   hp,a,b,sizeX,sizeY,score,dietime,sudu,boomimage,imagesrc
            enemys.push(new enemy(4,40,1120,80,80,5000,360,random(1,3),boomimg[0],faceimgM[m],2));
        }
        //大黄脸
        if(mark1==20){
            var b = random(0,2);
            enemys.push(new enemy(8,60,1100,150,160,30000,360,1,boomimg[0],faceimgB[b],3));
            mark1=0;
        }
        //小黄脸
        else{
            var s = random(0,21);
            enemys.push(new enemy(1,20,1180,50,50,1000,360,random(1,4),boomimg[0],faceimgS[s],1));
        }
        mark=0;
    }

    // 敌方黄脸脸状态判断
    var enemyslen=enemys.length;
    for(var i=0;i<enemyslen;i++){
        // 没有死，就移动
        if(enemys[i].faceisdie!=true){
            enemys[i].facemove();
        }
        // 超出边界，删除
        if(enemys[i].imagenode.offsetTop>720){
            mainDiv.removeChild(enemys[i].imagenode);
            enemys.splice(i,1);
            enemyslen--;
        }
        //死了   这里的处理是为了敌机死亡后，能留有一点时间显示死亡图片
        if(enemys[i].faceisdie==true){
            enemys[i].facedietimes+=20; // 死亡时长记录

            if(enemys[i].facedietimes == 80){
                enemys[i].imagenode.src = boomimg[1]
            }
            if(enemys[i].facedietimes == 160){
                enemys[i].imagenode.src = boomimg[2]
            }
            if(enemys[i].facedietimes==enemys[i].facedietime){  // 达到规定的死亡等候时间了 
                mainDiv.removeChild(enemys[i].imagenode);
                enemys.splice(i,1);
                enemyslen--;
            }
        }
    }

    // 创建子弹 每5次循环，创建子弹
    if(mark%5==0){
        bullets.push(new oddbullet(parseInt(selfking.imagenode.style.left)+31,parseInt(selfking.imagenode.style.top)-10));
    }

    //  子弹移动
    var bulletslen=bullets.length;
    for(var i=0;i<bulletslen;i++){
        bullets[i].bulletmove();

    //如果子弹超出边界,删除子弹
        if(bullets[i].bulletimage.offsetTop<20){
            mainDiv.removeChild(bullets[i].bulletimage);
            bullets.splice(i,1);
            bulletslen--;
        }
    }

    // 碰撞检测
    for(var k=0;k<bulletslen;k++){
        for(var j=0;j<enemyslen;j++){
            //判断碰撞本方白大王
            if(enemys[j].faceisdie==false){
                if(enemys[j].imagenode.offsetLeft+enemys[j].facesizeX>=selfking.imagenode.offsetLeft&&enemys[j].imagenode.offsetLeft<=selfking.imagenode.offsetLeft+selfking.facesizeX){
                  if(enemys[j].imagenode.offsetTop+enemys[j].facesizeY>=selfking.imagenode.offsetTop+40&&enemys[j].imagenode.offsetTop<=selfking.imagenode.offsetTop-20+selfking.facesizeY){
                      //碰撞本方白大王，游戏结束，统计分数
                      selfking.imagenode.src="images/die5.png";
                      enddiv.style.display="block";
                      score.innerHTML=scores;
                      if(document.removeEventListener){
                          mainDiv.removeEventListener("mousemove",move,true);
                          bodyobj.removeEventListener("mousemove",boundary,true);
                          selfking.imagenode.removeEventListener("click",pauseG,true);
                      }
                      else if(document.detachEvent){
                          mainDiv.detachEvent("onmousemove",move);
                          bodyobj.removeEventListener("mousemove",boundary,true);
                          selfking.imagenode.removeEventListener("click",pauseG,true);
                      }
                      clearInterval(set);
                      clearInterval(ourkingC);
                      clearInterval(musicState);
                      music.pause();
                  }
                }
                //判断子弹与敌机碰撞
                if((bullets[k].bulletimage.offsetLeft+bullets[k].bulletsizeX>enemys[j].imagenode.offsetLeft)&&(bullets[k].bulletimage.offsetLeft<enemys[j].imagenode.offsetLeft+enemys[j].facesizeX)){
                    if(bullets[k].bulletimage.offsetTop<=enemys[j].imagenode.offsetTop+enemys[j].facesizeY&&bullets[k].bulletimage.offsetTop+bullets[k].bulletsizeY>=enemys[j].imagenode.offsetTop){
                        //敌机血量减子弹攻击力
                        enemys[j].facehp = enemys[j].facehp-bullets[k].bulletattach;
                        //敌机血量为0，敌机图片换为爆炸图片，死亡标记为true，计分
                        if(enemys[j].facehp==0){
                            scores=scores+enemys[j].facescore;
                            scorelabel.innerHTML=scores;
                            enemys[j].imagenode.src=enemys[j].faceboomimage;
                            enemys[j].faceisdie=true;
                            if(enemys[j].facekind == 1){  
                                if(diefaceState1 !=null){
                                    clearInterval(diefaceState1)
                                    dieface1.pause();
                                }
                                diefaceState1 = setInterval(toggleSound(dieface1),1);
                            }else if(enemys[j].facekind == 2){
                                if(diefaceState2 !=null){
                                    clearInterval(diefaceState2)
                                    dieface2.pause();
                                }
                                diefaceState2 = setInterval(toggleSound(dieface2),1);
                            }else if(enemys[j].facekind == 3){
                                if(diefaceState3 !=null){
                                    clearInterval(diefaceState3)
                                    dieface3.pause();
                                }
                                diefaceState3 = setInterval(toggleSound(dieface3),1);
                            }
                            
                        }
                        //删除子弹
                        mainDiv.removeChild(bullets[k].bulletimage);
                            bullets.splice(k,1);
                            bulletslen--;
                            break;
                    }
                }
            }
        }
    }


}

// 开始游戏按钮点击事件
var set;
var musicState;
function begin(){
    startdiv.style.display="none";
    mainDiv.style.display="block";
    selfking.imagenode.style.display="block";
    scorediv.style.display="block";

    musicState = setInterval(toggleSound(music),1);
    /*
     调用开始函数
     */
    set=setInterval(start,20);
    ourkingC = setInterval(ourkingChange,20);
}

 // 为了解决浏览器不能自动播放的问题
 function toggleSound(music) {
    if (music.paused) { //判读是否播放  
        music.paused=false;
        music.play(); //没有就播放 
    }  
     
}