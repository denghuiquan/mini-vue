class Observer {
    constructor(data) {
        this.walk(data)
    }
    walk(data) {
        // 判断data是否是对象
        if (!data || typeof data !== 'object') {
            return
        }
        // 作用是遍历data中的所有属性
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })

    }

    defineReactive(obj, key, value) {
        let self = this
        // 负责收集依赖，并在必要时发送通知
        let dep = new Dependency()
        // 这里的作用是让对象深度响应式，即、如果value是对象，把value内部的属性转换成响应式数据
        this.walk(value)

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 收集依赖
                Dependency.target && dep.addSub(Dependency.target)
                // 这里的value参数就派上用场，可以避免造成get方法的循环调用，
                // 避免了Uncaught RangeError: Maximum call stack size exceeded
                // return obj[key]
                return value
            },
            set(newValue) {
                if (newValue === obj[key]) {
                    return
                } else if (obj[key] && typeof obj[key] === 'object') {
                    // 问题：这里不知道能处理几层的数据，目前只是适配了vm.data下的已存在对象属性
                    // 若果对象属性已存在，则分别修改值即可，没有的才设置setter/getter方法，避免页面元素观察者无法正常找回Dependency.target
                    Object.keys(newValue).forEach(k => {
                        if (obj[key][k] !== undefined) {
                            obj[key][k] = newValue[k]
                        } else {
                            // 
                            self.defineReactive(obj[key], k, newValue[k])
                        }
                    })
                } else {
                    value = newValue
                    self.walk(newValue)
                }
                // 发送数据更新通知
                dep.notify()
            }
        })
    }
}