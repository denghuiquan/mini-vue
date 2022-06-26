class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm
        // vm的data中的属性名称
        this.key = key
        // 指明如何更新视图，应该是由外部component传递给我们的
        this.cb = cb

        // 把watcher对象记录到Dependency类的静态属性target
        Dependency.target = this
        // 触发get方法，在get方法中会调用addSub
        // 这里的vm[key]就已经会触发get方法
        this.oldValue = vm[key]
        // 把Dependency类的静态属性target置空，防止统一vm[key]重复触发get方法是多次addSub添加同一个观察者
        Dependency.target = null
    }

    /**
     * 数据发生变化的时候，更新视图
     */
    update() {
        let newValue = this.vm[this.key]
        if(newValue === this.oldValue) {
            return
        }
        this.cb(newValue)
    }
    
}