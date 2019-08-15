# monologue.js

### What is it?
monologue提供了 "事件发出" 功能-通常称为 "pub/sub"-可以混合到由您的 JavaScript 对象继承。
##### Philosophy
monologue的 pub/sub 实现使用了观察者模式--这意味着用户应该直接参考发出事件的 "monologue" 对象。
这与monologue的姐妹library [postal. js] (http:/githubit. cong postaljal-padel. js) 形成鲜明对比, 后者使用中介模式来缓解出版商和订户之间直接引用的需要。
将monologue实例放在对象的原型链中, 将其转换为 "事件发射器"。这对于组织如何将对象要发布的内容通知其他 * 本地 * (在有限范围内的模块) 非常有用。
monologue的设计是为了与 [postal. js] 架起桥梁. 如果你想把一个事件推广到一个应用程序级别的消息中 '----而 [monopost] (http:/githubit. congs/postjs/monopost. js) 存在于这样做的附加内容中。



##### Really? Another Event Emitter?
 有许多事件发送器实现是非常有用的 (和紧凑的)-我最喜欢的是 [EventEmitter2](https://github.com/hij1nx/EventEmitter2)。那我为什么要写monologue呢？三个主要原因:

* **I wanted postal/AMQP-like wildcard binding semantics.**  
"*" 通配符与主题中的一个单词完全匹配, 而 "#" 通配符匹配 0 n 个单词。
* **I prefer an "envelope" payload in an event vs passing 0-n arguments to a subscriber callback.**  
这意味着我们在任何地方都能得到一致的回调签名。
* **I wanted to have a choice to opt-into safe invocation of subscriber callbacks.** 
大多数事件发送器样式实现 (我已经看到过) 盲目地触发订阅者回调-如果回调引发未捕获的异常, 则整个事件发出中断。"但不会尝试慢下来？ "是的, 有一个性能打击, 这就是为什么它是你选择进入的东西。(我问自己这两个问题: 事件发射器是我的应用中的瓶颈的次数？而一个订户回调有多少次对应用进行坦克化了？以我的经验, 后者发生的频率远远高于前者。

### Why should I use it?
如果要使用触发自定义事件的功能扩展对象, 请利用通配符绑定选项, 相信订阅者回调不能在发射器触发事件时启动发射器, 并且/或具有一致的回调签名, 然后monologue可能是给你的。

### How do I use it?
##### Adding monologue functionality to an instance
您可以使用 "mixInto" 帮助器函数, 该函数将monologue混合到对象的原型中:

	var Worker = function(name) {
	    this.name = name;
	};
	Worker.prototype.doWork = function() {
	    this.emit("work.done", { who: this.name });
	};
	Monologue.mixInto(Worker);

您还可以手动将monologue实例放在对象的原型链中:

	var Worker = function(name) {
	    this.name = name;
	};
	Worker.prototype = Monologue.prototype;
	Worker.prototype.doWork = function() {
	    this.emit("work.done", { who: this.name });
	};
另一种方法是通过 [lodash ' s] (http://lodash. com/) [assign] (http://lodash. comp # assign) 调用的帮助器向现有实例 "混合":

	_.assign(
	    plainJane,
	    {
	        doWork: function() {
	            this.emit("work.done", { who: this.name });
	        }
	    },
	    Monologue.prototype);
monologue使用 [riweter] (http:/githubit. com/ifandelse/riveter) 作为其遗传/mixin 能力。你可以用riverter做很多, 所以看看吧。

##### Adding an event listener
任何具有monologue行为的对象都有一个 "on" 方法, 可用于订阅事件。 "On ()" 的第一个参数是 "主题" (只是一个字符串事件名称, 可以选择是用于分层使用的周期分隔字符串)。 "On ()" 的第二个参数是事件发生时应调用的 "回调"。调用 "在" 返回 "订阅定义"-为您提供了一种方便的方式来取消订阅或将其他选项 (下文将讨论) 到订阅。

	var instance = new Worker(); // get an instance of something that has monologue's behavior

	// subscribe to listen for 'some.event'
	var subscription = instance.on("some.event", function(data, envelope){
	    console.log("Something happened thanks to " + data.name);
	});
正如您在上面的示例中所看到的, 订阅回调采用两个参数: "data" 和 "envelope"。 与monologue的许多方面一样, 这与postal.js 的行为相匹配。 "data"参数只是在发出事件时发布的数据。 "envelope" 提供有关事件的其他元数据, 并且可以根据您的需要进行自定义。 默认情况下, 信封有三个成员: "data"、"topic" 和 "timeStamp"。 例如:


	// pretending we're inside of a monologue-ized object:
	this.emit("some.event", { foo: 'bar', baz: 'bacon' });

	// pretending we're somewhere else setting up the subscriber:
	var subscription = instance.on("some.event", function(data, envelope){
		/*
		  data would look like:
			{
				foo: 'bar',
				baz: 'bacon'
			}

		  envelope would look like:
		  	{
		  		topic: 'some.event',
		  		timeStamp: '2012-10-21T02:53:10.287Z',
		  	    data: {
					foo: 'bar',
					baz: 'bacon'
				}
			}
		*/
	});

##### Wildcard Subscriptions
如上所述, "*" 和 "#" 字符表示订阅事件时可用的通配符。主题是字符串值, 通常以周期分隔。由句点分隔的主题部分称为 "单词"。使用 "*" 正好代表主题中的一个单词, 而 "#" 字符匹配 0-n 个单词。 例如:

	// The topic binding below will match "name.changed" and "city.changed"
	// but it will not match "changed" or "user.location.changed"
	var subscription = instance.on("*.changed", function(data, envelope){
		// handle event data here….
	});

	// The topic binding below will match "name.changed", "city.changed"
	// "changed" and "user.location.changed"
	var subscription = instance.on("#.changed", function(data, envelope){
		// handle event data here….
	});

	// Also - you can use the wildcards together:
	// this binding will match user.email.validation.failed, user.zip.validation.success
	// as well as password.validation.success, but NOT customer.order.validation.retry.cancel
	var subscription = instance.on("#.validation.*", function(data, envelope){
		// handle event data here….
	});

##### Unsubscribing
You have four possible ways to remove event listeners in monologue:

###### Removing a specific listener
当您使用 "on" 订阅事件时, 它将返回 "订阅定义" 对象。此对象包含多个帮助器方法, 其中一种是 "取消订阅":


	var subscription = instance.on("#.changed", function(data, envelope){
		// handle event data here….
	});

	subscription.unsubscribe();

###### Removing all listeners for a topic
但是, 您也可以在单元事件发射器对象上调用 "off" 方法:

	var subscription = instance.on("#.changed", function(data, envelope){
		// handle event data here….
	});

	// remove just this one subscription
	instance.off(subscription);

	// remove all subscriptions for a topic
	instance.off("#.changed");

###### Removing all listeners for a topic/context combination
子脚本定义帮助器方法之一是 "取消上下文"-它允许您指定要在调用订阅回调时应用于该回调的 "this" 上下文。因此, 可以删除使用特定 "上下文" 的特定主题的所有侦听器:

	var subscription = instance.on("#.changed", function(data, envelope){
		// handle event data here….
	}).withContext(someObject);

	// remove just this one subscription
	instance.off(subscription);

	// remove all subscriptions for the topic + context combination
	instance.off("#.changed", someObject);

###### Removing ALL listeners, period.
这是 ' nuke it from orbit ' 的选项。只需在没有参数的情况下调用 "off", 所有订阅都将从对象中删除。

	var subscriptionA = instance.on("#.changed", function(data, envelope){
		// handle event data here….
	}).withContext(someObject);

	var subscriptionB = instance.on("*.moar", function(data, envelope){
		// handle event data here….
	}).withContext(someOtherObject);

	// buh-bye all subscriptions...
	instance.off();

##### Subscription Options
如上所述, 从调用到 "on" 方法返回的 "SubscriptionDefinition" 对象提供了一些额外的流畅配置选项:
As mentioned above - the `SubscriptionDefinition` object returned from a call to the `on` method provides some additional fluent configuration options:

* **`withContext(object)`** - 提供的参数将成为订阅回调中的 "this" 上下文。
* **`defer`** - 延迟回调的调用, 直到事件循环空闲 (通过设置超时0毫秒)
* **`disposeAfter(count)`** - 在指定的调用次数后自动取消订阅订阅。
* **`once`** - disposeAfter(1) 的快捷方式。
* **`distinctUntilChanged`** -跟踪与事件一起发布的最后一个数据, 并且仅在新数据与旧数据不同时才调用回调。
* **`distnct`** - 跟踪随事件发布的数据, 并且仅在回调与以前发布的任何数据不同时才调用回调。
* **`withConstraint(predicateFn)`** -参数是一个与订阅者回调 (数据、信封) 具有相同签名的函数。 从此函数返回 true 将导致调用订阅回调, 返回 false 将阻止它触发。
* **`withConstraints([predicateFns])`** - 与 "withConstraints" 相同, 但它需要一个数组, 而不是一个。
* **`withDebounce(milliseconds)`** - 使用underline的 debounce 函数, 使订阅回调仅在事件停止发布后调用至少 {x} 毫秒。
* **`withDelay(milliseconds)`** - 在指定的毫秒数内延迟对订阅者回调的调用。
* **`withThrottle(milliseconds)`** - 每个 {x} 毫秒互交织最多调用一次订阅者回调

##### Other Monologue Options
###### Customizing the Envelope
任何使用monologue行为扩展的对象都将有一个 "getEnvelope" 方法, 您可以重写该方法以自定义envelope的创建方式。默认实现如下所示:


	// The default implementation just marks the envelope with a time stamp.
	// The topic and data are attached to the envelope just before it's published
	getEnvelope: function(topic, data) {
		return {
			timeStamp: new Date()
		};
	}
请注意, 发布的主题和数据是为了供选择使用而传递的, 允许您根据正在进行的事件在运行时配置envelope数据。

###### Error Tracking
monologue的核心功能之一是, 订阅者回调将无法 通过未捕获的异常 crash事件发送器。
虽然开发人员 * * 应该在自己之后进行清理 (而不是在未捕获的异常中崩溃), 但他们并不总是这样做。
我们不希望简单地吞下这些异常, 因此默认情况下, monologue会将它们存储在一个恰当的命名为 "_ yuno" 成员中
--它是一个对象数组, 其中每个对象都包含引发未捕获的异常的订阅定义实例, 以及envelope在事件发生时发布。 
您可以通过将 "_ trackErrors" 成员设置为 "false" 来关闭错误跟踪:

	var Worker = function(name) {
	    this.name = name;
	};
	Worker.prototype = Monologue.prototype;
	var instance = new Worker();
	instance._trackErrors = false;


##### Customizing Wildcard Bindings
就像姐妹库 postal. Js 一样, 独白的绑定解析器对象可以用你自己的实现来覆盖。
不喜欢 AMQP 的通配符是如何工作的？想要创建使用不同字符或匹配主题中的逻辑的内容？
您所要做的就是创建一个实现 "compare (binding, topic)" 方法的对象 (其中 "binding" 是添加订阅者时使用的主题值, 而 "topic" 是正在发布的事件的实际主题)。
此函数应返回为 true 的匹配项, 或 false。 只需创建自己的解析器, 并将现有的解析器替换为您自己的解析器:

	Monologue.resolver = {
	    compare: function(binding, topic) {
	         // The magic happens here….
	    }
	}

## Build, Dependencies, etc.

* monologue depends on [lodash.js](http://lodash.com/) and a fork of [riveter](https://github.com/ifandelse/riveter/tree/0cffebb92117c88543cb4359fb9fd69c2d65dd22)
* monologue uses [gulp.js](http://gulpjs.com/) for building, running tests and examples.
    * To build
        * run `npm install` (to install all deps)
        * run `bower install` (yep, we're using at least one thing only found on bower in the local project runner)
        * run `gulp` then check the lib folder for the output
    * To run tests & examples
        * Tests are node-based: `gulp test`
        * To run browser-based examples:
            * run `gulp server`
            * navigate in your browser to <http://localhost:3080/>
            * if you want to see test coverage or plato reports be sure to run `gulp coverage` and `gulp report` (respectively) in order to generate them, as they are not stored with the repo.

