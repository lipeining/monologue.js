// * #的解析
// pattern = "^" + _.map( binding.split( "." ), function mapTopicBinding( segment ) {
//   var res = "";
//   if ( !!prevSegment ) {
//     res = prevSegment !== "#" ? "\\.\\b" : "\\b";
//   }
//   if ( segment === "#" ) {
//     res += "[\\s\\S]*";
//   } else if ( segment === "*" ) {
//     res += "[^.]+";
//   } else {
//     res += segment;
//   }
//   prevSegment = segment;
//   return res;
// } ).join( "" ) + "$";
// rgx = this.regex[ binding ] = new RegExp( pattern );

// 订阅的定义是一个对象，以topic为键名，对应的topic可能有多个回调函数，数组
// self._subscriptions = self._subscriptions || {};
// self._subscriptions[topic] = self._subscriptions[topic] || [];
// self._cache也是一个以topic为键名的对象， 每一个topic可能有多个subDef
// 之后会使用subDef   invokeSubscriber，发送消息。
// 也就是每一个subDef也会使用cacheKeys: [] 存储自己对应的cache信息。
// 在移除subscriber时，删除掉对应的cache
// 	// remove SubscriptionDefinition from cache
// 	if ( subDef.cacheKeys && subDef.cacheKeys.length ) {
// 		var key;
// 		while ( key = subDef.cacheKeys.pop() ) {
// 			_.each( emitter._cache[ key ], getCachePurger( subDef, key, emitter._cache ) );
// 		}
// 	}


// var SubscriptionDefinition = function( topic, callback, emitter ) {
// 	this.topic = topic;
// 	this.callback = callback;
// 	this.pipeline = [];
// 	this.cacheKeys = []; // 缓存的cacheKeys
// 	this._context = undefined;
// 	this.emitter = emitter; // 对应的Monologue对象或者其他minIn对象
// };
// _context是定义时传入的context。主要用于off方法时，对应的删除对应的回调方法。
// var subscription = instance.on("#.changed", function(data, envelope){
//   // handle event data here….
// }).withContext(someObject);

// // remove just this one subscription
// instance.off(subscription);

// // remove all subscriptions for the topic + context combination
// instance.off("#.changed", someObject);
// this.pipeline.push(function(data, env, next) {
//     next(data, env);
//     dispose();
// });
// pipeline = pipeline.concat( [ self.callback ] );
// var step = function step( d, e ) {
//   idx += 1;
//   这里的代码有点莫名其妙，虽然将[self.callback]放入了pipeline,但是，使用的len
//   是旧的len,所以，还是需要手动调用一次self.callback来终止step环。
//   if ( idx < len ) {
//     pipeline[ idx ].call( context, d, e, step );
//   } else {
//     self.callback.call( context, d, e );
//   }
// };
// step(data, env, 0);
// pipeline保存了可以执行的次数，在after这个次数之后，会注销回调函数

// * ** `distnct` ** - 跟踪随事件发布的数据, 并且仅在回调与以前发布的任何数据不同时才调用回调。
// 之前的数据会存储在一个previous数组中。
// distinct: function distinct() {
//   return this.constraint( new DistinctPredicate() );
// },

// * **`distinctUntilChanged`** -跟踪与事件一起发布的最后一个数据, 并且仅在新数据与旧数据不同时才调用回调。
// 之前的数据存储在一个previeous对象中
// distinctUntilChanged: function distinctUntilChanged() {
//   return this.constraint( new ConsecutiveDistinctPredicate() );
// },