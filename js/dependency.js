class Dependency {
    constructor() {
        // 初始化subs数组用于存储所有的观察者
        this.subs = []
    }
    /**
     * 添加观察者
     * @param {*} sub 
     */
    addSub(sub) {
        if (sub && typeof sub.update === 'function') {
            this.subs.push(sub)
        }
    }

    // 向所有订阅类该数据依赖的观察者发送更新通知
    notify() {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}