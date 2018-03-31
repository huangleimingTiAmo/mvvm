//发布订阅模式   
//绑定的方法，都有一个updata属性
function Dep(){
    this.subs = [] //事件池
}
Dep.prototype.addSub = function(sub){//订阅
    this.subs.push(sub)
};
Dep.prototype.notify = function(){
    this.subs.forEach(sub=>sub.updata());
};



function Watcher(fn){
    this.fn=fn
}
Watcher.prototype.updata=function(){
    this.fn()
}
let watcher = new Watcher(function(){
    console.log(1)
})


let dep = new Dep()
dep.addSub(watcher)
dep.addSub(watcher)
console.log(dep.subs)
dep.notify()