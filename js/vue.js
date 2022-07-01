class Vue {
    /**
     * 构造函数中进行初始化，步骤如下：
     * @param {*} options 
     */
    constructor(options) {
        // 01 通过属性保存选项options的数据
        this.$options = options || {}
        this.$data = options.data || {}
        this.$methods = options.methods || {}
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el // 如果el是undefined呢？

        // 02 把data中的成员转换成getter/setter，注入到啊Vue实例中
        this._proxyData(this.$data)
        this._proxyData(this.$methods) // 这里是否要考虑方法属性的不可修改
        // 03 调用observer对象将它数据变化为响应式数据
        this._oberser = new Observer(this.$data)
        // 04 调用compiler对象，解析指令/差值表达式
        this._compiler = new Compiler(this)
    }

    static set(obj, propertyName, value) {
        obj[propertyName] = value
        // new Observer({ [propertyName]: obj[propertyName] })
    }

    _proxyData(data) {
        let self = this
        // 遍历data的所有属性，
        Object.keys(data).forEach(key => {
            // 把data的属性注入到vue实例中。
            Object.defineProperty(self, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newValue) {
                    if (newValue === data[key]) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }
}