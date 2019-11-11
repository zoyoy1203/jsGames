function Mine(tr,td,mineNum){
    this.tr = tr; // 行数
    this.td = td; // 列数
    this.mineNum = mineNum; // 雷数
    
    this.squares = [];  // 存储所有方块的信息，它是一个二维数组，按行与列的顺序排放，存取都使用行列的形式
    this.tds = [];  // 存储所有单元格的DOM
    this.surplusMine = mineNum // 剩余雷的数量
    this.allRight = false; // 右击标的小红旗是否全是雷

    this.parent = document.querySelector('.gameBox');
}

// 生成n个不重复的数字
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr*this.td);
    for(var i =0; i<square.length; i++) {
        square[i]=i;
    }
    // console.log(square);
    square.sort(function(){return 0.5-Math.random()});  // 随机排序
  
    return square.slice(0,this.mineNum);   
}

Mine.prototype.init = function () {
    var rn = this.randomNum(); // 雷在格子里的位置
    var n = 0;  // 用来找到格子对应的索引
    for(var i = 0; i<this.tr; i++){
        this.squares[i] = [];
        for(var j = 0; j<this.td; j++) {
        
            // 取一个方块在数组里的数据要使用行与列的形式去取。
            //找方块周围的方块的时候要用坐标的形式去取。行与列的形式跟坐标的形式x,y是刚好相反的。
            if(rn.indexOf(n)!=-1){
                this.squares[i][j]={type:'mine',x:j,y:i}
            }else{
                this.squares[i][j]={type:'number',x:j,y:i,value:0}
            }
            n++;
        }
    }

    // console.log(this.squares);
    this.updateNum();
    this.createDom();

    
    this.parent.oncontextmenu = function () {   // 禁止鼠标右键菜单显示
        return false;
    }

    // 剩余雷数
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;

}

Mine.prototype.createDom = function() {
    var This = this;
    var table = document.createElement('table');
    for(var i = 0; i < this.tr; i++){   // 行
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for(var j = 0; j<this.td; j++) {   // 列
            var domTd = document.createElement('td');
            // domTd.innerHTML = 0;

            domTd.pos = [i,j];  // 把格子对应的行与列存到格子身上，为了下面通过这个值到数组里取对应的数据
            domTd.onmousedown = function() {
                This.play(event, this) // This 指的是实例对象， this指的是点击的那个td
            }

            this.tds[i][j] = domTd;
            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className= 'mine'
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
          

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

//  获取某个格子周围的8个格子
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];  // 把找到的格子的坐标返回出去（二维数组）

    // 通过坐标循环九宫格
    for(var i=x-1; i<=x+1; i++){
        for(var j=y-1; j<=y+1; j++){
            if(
                i<0 ||   // 格子超出左边范围
                j<0 ||   // 格子超出上边范围
                i>this.td-1 ||   // 格子超出右边边范围
                j>this.tr-1 ||  // 格子超出下边范围
                (i==x && j==y) ||   // 当前循环到的格子是自己，
                this.squares[j][i].type == 'mine'   // 周围的格子是个雷
            ){
                continue;
            }

            result.push([j,i]);   // 要与行与列的形式返回出去，因为到时候需要用它去取数组里的数据

        }
    }

    return result;
}


// 更新所有的数字
Mine.prototype.updateNum = function(){
    for(var i=0; i<this.tr; i++){
        for(var j=0; j<this.td; j++) {
            // 只更新雷周围的数字
            if(this.squares[i][j].type == 'number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j]);  // 获取到每一个雷周围的数字
            for(var k=0; k<num.length; k++){
                this.squares[num[k][0]][num[k][1]].value +=1;
            }
        }
    }
}

Mine.prototype.play = function(ev,obj) {
    var This = this;
    if(ev.which == 1 && obj.className !='flag'){   // 用户标完小红旗后，就不能使用左键点击
        // 点击的是左键
        // console.log(obj);
        console.log(this.squares);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];

        console.log(curSquare);
        if(curSquare.type == 'number') {
            console.log('点到数字')
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if(curSquare.value == 0){
               /*  
                当用户点到了数字0
                 1. 显示自己
                 2. 找四周
                    1. 显示四周，（如果四周的值不为0，那就显示到这里，不需要再找了）
                    2. 如果值为0
                        1. 显示自己
                        2. 找四周
                            。。。。。 递归
               */
                obj.innerHTML = '';
                function getAllZero(square) {
                    var around = This.getAround(square);   // 找到了周围的N个格子
                    for(var i =0; i<around.length; i++) {
                        var x = around[i][0];  // 行
                        var y = around[i][1];   // 列

                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        
                        if(This.squares[x][y].value == 0) {
                            // 如果以某个格子为中心找到的格子值为0，那就需要接着调用函数（递归）
                            if(!This.tds[x][y].check){
                                // 给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过。如果找过的话，它的值就为true
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else{
                            //  如果以某个格子为中心找到的格子值不为0，就显示该数字
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        }else{
            // 点到雷
            // console.log('点到雷')
            this.gameOver(obj);
        }
    }

    // 用户点击的是右键
    if(ev.which == 3) {
        // 如果右击的是一个数字，那就不能点击
        if(obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '':'flag';  // 切换class
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true;
        }else{
            this.allRight = false;
        }

        if(obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        
        if(this.surplusMine == 0) {
            // 剩余的雷的数量为0，表示用户已经标完小红旗了。这时候判断游戏是成功还是失败
            if(this.allRight){
                alert('恭喜你！游戏通过！');
            }else{
                alert('游戏失败！');
                this.gameOver();
            }
        }

    }
}

// 游戏失败函数
Mine.prototype.gameOver = function (clickTd) {
    /* 
        1. 显示所有的雷
        2. 取消所有格子的点击事件
        3. 给点中的那个雷标上一个红
    */
   for(var i =0; i<this.tr; i++){
       for(var j=0; j<this.td; j++){
           if(this.squares[i][j].type == 'mine'){
               this.tds[i][j].className = 'mine';
           }
           this.tds[i][j].onmousedown = null;
           
       }
   }

   if(clickTd) {
       clickTd.style.backgroundColor = '#f00';
   }
}


// 菜单栏按钮功能
var btns = document.querySelectorAll('.level button');
var mine = null; // 用来存储生成的实例
var ln =0; //用来处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]];  // 不同级别的行数列数和雷数
for(let i = 0; i<btns.length-1; i++) {
    btns[i].onclick = function() {
        btns[ln].className = '';
        this.className = 'active';
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}

btns[0].onclick();
btns[3].onclick = function() {
    mine.init();
}
// var mine = new Mine(28,28,99);
// mine.init();
