var Sequelize = require ('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect' : 'sqlite',
	'storage' : __dirname + '/basic-sqlite.sqlite'
});


var Todo = sequelize.define ('todo',{
	description: {
		type: Sequelize.STRING,
		allowNull : false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});




sequelize.sync().then(function(){
	console.log('everything is syn');

	Todo.findById(8).then(function(todo){
		if (todo) {
			console.log(todo.toJSON());
		}else{
			console.log('todo not found');
		}
	});

	// Todo.create({
	// 	description : 'hello world',
	// 	completed: false
	// }).then(function (todo){
		
	// 	return Todo.create({
	// 		description : 'clean office'
	// 	});

	// }).then(function(){
	// 	//return Todo.findById(3)
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%office%'
	// 			}
	// 		}
	// 	});
	// }).then(function(todos){
	// 	if (todos) {
	// 		todos.forEach(function (todo){
	// 			console.log(todo.toJSON());
	// 		});
	// 	}else{
	// 		console.log('no todo found!');
	// 	}
	// }).catch(function(e){
	// 	console.log(e);
	// });
});