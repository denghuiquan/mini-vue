class Compiler {
    constructor(vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }
    /**
     * 编译模版，处理文本节点和元素节点
     * @param {*} el 
     */
    compile(el) {
        if (el instanceof Element) {
            let childNodes = el.childNodes
            // 遍历节点，根据不同的节点做不同的解析渲染操作
            Array.from(childNodes).forEach(node => {
                if (this.isElementNode(node)) {
                    this.compileElement(node)
                } else if (this.isTextNode(node)) {
                    this.compileText(node)
                }
                // 递归处理深层次节点的编译，判断node节点是否有子节点，如果有子节点要递归调用compile
                if (node.childNodes && node.childNodes.length) {
                    this.compile(node)
                }
            })
        }
    }
    /**
     * 编译元素节点，处理指令
     * @param {*} node 
     */
    compileElement(node) {
        // 遍历元素下的所有属性节点
        // 判断是否是指令
        Array.from(node.attributes).forEach(attr => {
            let attrName = attr.name
            let key = attr.value
            if (this.isDirective(attrName)) {
                // v-text -> text  v-model -> model v-html -> html v-on:xxx -> on:xxx
                attrName = attrName.substr(2)
                if (attrName.startsWith('on')) {
                    // 处理v-on指令注册事件监听
                    this.onEventUpdater(node, key, attrName.substr(3))
                } else {
                    // 交给update辅助更新方法进行处理
                    this.update(node, key, attrName)
                }
                // 首次渲染时创建watcher对象，当数据改变时更新视图
                /* new Watcher(this.vm, key, (newVal) => {
                    this.update(node, key, attrName)
                }) */
            }
        })
    }
    update(node, key, attrName) {
        this.parseDotKeyValue(key, this.vm, (value) => {
            let updateFn = this[attrName + 'Updater']
            updateFn && updateFn.call(this, node, value, key)
        })
    }
    // 用于处理v-on directive, 实现 v-on 指令
    onEventUpdater(node, value, eventKey) {
        // v-on是支持监听eventKey事件，触发vm中的methods
        // 这里的methods同样需要提前在vue实例初始化的时候把它挂在到vm对象上
        node.addEventListener(eventKey, (e) => {
            this.vm[value](e)
        })
    }
    // 用于处理v-html directive, 实现 v-html 指令
    htmlUpdater(node, value) {
        node.innerHTML = value
    }
    // 用于处理v-text directive
    textUpdater(node, value) {
        node.textContent = value
    }
    // 用于处理v-model directive
    /**
     * 
     * @param {HTMLElement} node 
     * @param {string} value 
     */
    modelUpdater(node, value, key) {
        node.value = value
        // v-model是支持双向绑定的，所以这里监听input事件，同步文本框的值到vm.$data中 'input'/'changes', Vue中使用的是input
        node.addEventListener('input', ev => {
            const keyList = key.split('.').reverse()
            // 构建值
            keyList.reduce((prev, current, index) => {
                if (index === keyList.length - 1) {
                    this.vm[current] = prev
                }
                return { [current]: prev }
            }, node.value)

        })
    }
    /**
     * 处理文本节点，处理差值表达式
     * @param {*} node 
     */
    compileText(node) {
        let reg = /\{\{(.+?)\}\}/ // ()具有分组功能
        let textContent = node.textContent
        if (reg.test(textContent)) {
            // 找到文本节点在的差值表达式进行编译处理，替换成我们的vm[key]中对应值
            // 思考：差值表达是如果真是个表达式呢
            const key = reg.exec(textContent)[1].trim()
            this.parseDotKeyValue(key, this.vm, newVal => {
                node.textContent = textContent.replace(reg, newVal)
            })
            // node.textContent = textContent.replace(reg, value)

            // 首次渲染时创建watcher对象，当数据改变时更新视图
            /* new Watcher(this.vm, key, (newVal) => {
                node.textContent = textContent.replace(reg, newVal)
            }) */
        }
    }
    /**
     * 处理带点取值的data key, 例如person.name => vm['person']['name]
     * @param {string} key 
     * @param {Vue} vm 
     * @returns 
     */
    parseDotKeyValue(key, vm, callback) {
        let value = key.split('.').reduce((prev, current, index) => {
            let currentValue = prev[current]
            // 首次渲染时创建watcher对象，当数据改变时更新视图
            new Watcher(prev, current, (newVal) => {
                if (!currentValue || typeof currentValue !== 'object') {
                    callback(newVal)
                }
            })
            return currentValue
        }, vm)
        callback(value)
    }
    /**
     * 判断元素属性是否为指令，v-xxx
     * @param {*} attrName 
     */
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    /**
     * 判断是否为文本节点
     * @param {*} node 
     */
    isTextNode(node) {
        return node.nodeType === 3
    }
    /**
     * 判断是否为元素节点
     * @param {*} node 
     */
    isElementNode(node) {
        return node.nodeType === 1
    }
}