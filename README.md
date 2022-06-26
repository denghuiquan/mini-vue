# 目标：模拟一个最小版本的Vue
### 前置知识
+ 数据驱动
    - 数据响应式
        * 数据模型仅仅是普通的JavaScript对象，而当我们修改数据时，视图会进行更新，避免了繁琐的DOM操作，提高开发效率。
    - 双向绑定
        * 数据改变，视图改变；视图改变，数据也随之改变。
        * 我们可以使用v-model在表单元素上创建双向数据绑定。
    - 数据驱动
        * Vue最独特的特性之一
        * 开发过程中仅需要关注（业务）数据本身，不需要关心数据是如何渲染到视图的。
        * 一种开发的过程，不需要关注数据如何渲染到DOM上。
        * 	MVVM
+ 响应式的核心原理
    - Vue2.x
        * 当你把一个普通的JavaScript对象传入Vue实例作为data选项，Vue将遍历此对象所有的属性，并使用Object.defineProperty把这些属性全部转为getter/setter。
        * 不支持IE8以及更低版本的浏览器的原因是，其使用的Object.defineProperty是ES5中一个无法被shim(降级兼容)的特性。
        * Vue2.x关键响应式核心：
            ```Object.defineProperty```
        * 	数据劫持
        * + 当我们访问或设置被劫持对象的成员的时候，做一些干预操作。
        * + 该如何处理对象中的多个属性需要做getter/setter数据劫持？
        *     - 需要遍历对象中的属性，使用Object.defineProperty把这些遍历到的属性转换为getter/setter
        *     - 这就需要基于Object.defineProperty进行封装，定义一个类似Proxy的数据对象代理，用它来把传入的数据进行属性操作的劫持。
    - Vue3.0
        * 利用的是ES6中新增的：Proxy
        * 	The Proxy object enables you to create a proxy for another object, which can intercept and redefine fundamental operations for that object.
        * 	它直接监视对象，而非属性
        * + 为对象属性设置getter/setter的时候不需要循环
        *     - 性能比Object.defineProperty要好
        * 	ES6中新增，IE不支持，性能由浏览器优化
+ 发布订阅模式和观察者模式
    - 发布订阅模式
        * 订阅者
        * 发布者
        * 信号中心
        * 模拟Vue自定义事件的实现
        * 	兄弟组件通信过程
    - 观察者模式
        * Watcher 观察者（相当于订阅者）
        * 	update(): 当事件发生时，具体要做的事情。
        * Dependency 目标（相当发布者）
        * 	subs 数组：存储所有的观察者
        * 	addSub()：添加观察者
        * 	notify()：当事件发生，调用所有观察者的update() 方法
        * 没有事件信号中心
    - 差异总结
        * 01 观察者模式是由具体目标调度，比如当事件触发，dependency就会去调用观察者的方法，所以观察者模式的订阅者与发布者之间存在依赖关系，也就是发布者对订阅者是有要求的，必须提供一个可以供发布者在进行更新通知的时候调用。
        * 02 发布/订阅模式由统一调度中心调用，因此发布者和订阅者不需要知道对方的存在。
        * 	事件调度中心是隔离发布者和订阅者，减少发布者和订阅者之间的依赖关系，使之变得更灵活。
	模拟Vue的响应式原理
+ Vue响应式原理分析
    - 整体分析
        * Vue基本结构
        * Vue实例对象观察
        * 最小整体结构
        * 	Vue
        * 	Compiler解析指令
        * 	Observer数据劫持
        * 	Watcher观察者
        * 	Dependency发布者
    - vue
        * 功能
        * 	负责接受初始化的参数（选项）
        * 	负责把data中的属性注入得到Vue实例，转换成getter/setter
        * 	负责调用Observer监听data中所有属性的变化
        * 	负责调用compiler解释指令/差值表达式
        * 最小Vue结构
        * 	$options
        * 	$el
        * 	$data
        * 	_proxyData()
    - Observer
        * 功能
        * 	负责把data的属性转换成响应式数据
        * 	data中的某个属性也是对象，把该属性转换成响应式数据。（迭代实现深度响应式）
        * 	数据变化发送通知
        * 结构
        * 	walk(data)
        * + 作用是遍历data中的所有属性，所以参数是data
        * 	defineReactive(data, key, value)
        * + 作用是定义响应式数据，
        * + 注意点
        *     - 如何避免getter的循环调用导致RangeError: Maximum call stack size exceeded
        *     - 响应式数据的深度响应式实现
        *     - 给响应式数据重新赋值为一个新对象的时候，新数据对象的响应式实现
    - Compiler
        * 功能
        * 	负责编译模版解析指令/差值表达式
        * 	负责页面的首次渲染
        * 	当数据变化后重新渲染视图
        * 	一句话总结，compiler就是在做dom操作
        * 结构
        * 	el
        * 	vm
        * 	compile(el)
        * + 遍历节点，根据不同的节点做不同的解析渲染操作
        * 	compileElement(node)
        * 	compileText(node)
        * 	isDirective(attrName)
        * 	isTextNode(node)
        * 	isElementNode(node)
    - Watcher
        * 功能
        * 	当数据变化触发依赖，dep通知所有得到Watcher实例更新视图
        * 	自身实例化的时候往dep对象中添加自己
        * 	需要根据VM的更新值操作DOM，而我们的DOM操作都是在Compiler中渲染的。所以我们要在页面元素的指令或差值表达式处理得到时候创建相对应的Watcher。
        * 结构
        * 	vm
        * 	key
        * 	cb
        * + 指明如何更新视图，应该是由外部component传递给我们的
        * 	oldValue
        * 	update
        * + 这里面需要更新视图
    - Dependency
        * 功能
        * 	在响应式数据定义的getter中，收集依赖，添加观察者（Watcher）
        * 	在响应式数据定义的setter中，通知所有观察者
        * 结构
        * 	subs
        * 	addSub(sub)
        * 	notify