function Huang (options={}){
    this.$options = options //vm.$options,将所有属性挂载到$options
    var data = this._data = this.$options.data;
    observe(data);
    // this代理了this._data
    for(let key in data){
        Object.defineProperty(this,key,{
            enumerable:true,
            get(){
                return this._data[key];//this.a={a:1}
            },
            set(newval){
                this._data[key] = newval
            }
        })
    };
    new Compile(options.el,this)
}


function Compile(el,vm){
    //el标识替换范围let
    vm.$el = document.querySelector(el);
    //创建文档碎片  
    let fragment = document.createDocumentFragment();
    while(child = vm.$el.firstChild){//将app中的内容移入内存中
        fragment.appendChild(child)
    }


    replace(fragment)
    function replace(fragment){
        Array.from(fragment.childNodes).forEach(function(node){
            let text  =  node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if(node.nodeType===3&&reg.test(text)){
                console.log(RegExp.$1)//a.a  vm.b
                let arr = RegExp.$1.split('.')//[a,a]
                let val = vm;
                arr.forEach(function(k){//取this.a.a   this.b
                    val = val[k]
                });

                new Watcher(function(vm,RegExp.$1,newval){
                    node.textContent = text.replace(/\{\{(.*)\}\}/,newval)
                    
                })

                //替换的逻辑
                node.textContent = text.replace(/\{\{(.*)\}\}/,val)
            }
            if(node.nodeType === 1){
                let nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(function(attr){
                    let name  = attr.name;//type=text
                    let exp = attr.value;//v-molde=b
                    if(name.indexOf('v-')==0){
                        node.value = vm[exp]
                    }
                    new Watcher(vm,exp,function(newval){
                        node.value = newval// watcher触发时自动将内容放入输入框
                    });
                    node.addEventListener('input',function(e){
                        let newval = e.target.value;
                        vm[exp]=newval
                    })


                    
                })
            }
            if(node.childNodes){
                replace(node)
            }
         })
    }

    
    vm.$el.appendChild(fragment)
}

//观察对象，给对象增加Object.define.property
function Observe(data){
    let dep = new Dep()

    //把data属性通过Object.define.property方式定义
    for(let key in data){
        let val = data[key];

        observe(val)
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                Dep.target&&dep.addSub(Dep.target)
                return val
            },
            set(newval){
                if(newval===val){//判断是否和以前设置一样
                    return
                }
                val = newval;
                observe(newval);
                dep.notify();  //让watcher的updata方法执行即可
            }
        })
    }


}
function observe(data){
    if(typeof data!=="object")return
    return new Observe(data)
}


//发布订阅
function Dep(){
    this.subs = [] //事件池
}
Dep.prototype.addSub = function(sub){
    this.subs.push(sub)
};
Dep.prototype.notify = function(){
    this.subs.forEach(sub=>sub.updata());
};


//watcher
function Watcher(vm,xep,fn){
    this.fn=fn;
    this.vm = vm;
    this.exp = exp;
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.')
    arr.forEach(function(k){
        val = val[k]
    })
    Dep.target = null;
}
Watcher.prototype.updata=function(){
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function(k){
        val = val[k]
    })
    this.fn()
}