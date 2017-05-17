var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 8080;
var todos = [];
var todoNextid = 1 ;

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send("Todo API Root!");
});


// // To get all todos
// app.get('/todos', function (req, res){
// 	res.json(todos);
// });

//to get /todos?completed=true

app.get('/todos', middleware.requireAuthentication, function(req, res){
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	}else if (query.hasOwnProperty('completed') && query.completed === 'flase') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like : '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function (todos){
		res.json(todos);
	}, function (e){
		res.status(500).send();
	});


	// var filteredTodos = todos;
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true') {
	// 	filteredTodos = _.where(filteredTodos, {completed: true});
	// }else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
	// 	filteredTodos = _.where(filteredTodos, {completed: false});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo){
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	// res.json(filteredTodos);

});


//To get todos by id 
app.get('/todos/:id', middleware.requireAuthentication, function(req, res){
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function(todo){
		if (todo) {
			res.json(todo.toJSON());
		}else{
			res.status(404).send('No Todo Found!');
		}
	}, function (e){
		res.status(500).send();
	});

	// var x = _.findWhere(todos, {id: todoId});
	// // var x ;
	// // todos.forEach(function (todo){
	// // 	if(todoId === todo.id){
	// // 		x = todo;
	// // 	}
	// // });		if (x) {
	// // 		res.json(x)
	// // 	}else{
	// // 		res.status(404).send();
	// // 	}

	// 	if (x) {
	// 		res.json(x);
	// 	}else{
	// 		res.status(404).send();
	// 	}

});


//TO create todos
app.post('/todos', middleware.requireAuthentication, function(req, res){
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());
		});
	},function (e){
		res.status(400).json(e);
	});
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }

	// body.description = body.description.trim();

	// body.id = todoNextid++;

	// todos.push(body);

	// res.json(body);
});

//To delete todos by id

app.delete('/todos/:id', middleware.requireAuthentication, function (req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function (rowsDeleted){
		if (rowsDeleted === 0){
			res.status(404).json({
				error: 'No Todo with Id'
			});
		}else {
			res.status(204).send('Done');
		}
	},function (e){
		res.status(500).json(e);
	});


	// var MatchedTOdo = _.findWhere(todos, {id: todoId});

	// if (!MatchedTOdo) {
	// 	res.status(404).json({"error": "Requested Id doesn't Found"});
	// }else{
	// 	todos = _.without(todos, MatchedTOdo);
	// 	res.json(MatchedTOdo);
	// }
});

//To Update todos 

app.put('/todos/:id', middleware.requireAuthentication, function (req, res){
	var todoId = parseInt(req.params.id, 10);
	//var MatchedTOdo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	//var validAttributes = {};
	var	Attributes = {};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	 	Attributes.completed = body.completed;
	 }

	 if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
	 	Attributes.description = body.description;
	 }

	 db.todo.findById(todoId).then(function (todo){

	 	if (todo) {
	 		return todo.update(Attributes);
	 	}else{
	 		res.status(404).send();
	 	}

	 },function (){
	 	res.status(500).send();
	 }).then(function(todo){
	 	res.json(todo.toJSON());
	 },function (){
	 	res.status(404).send();
	 });

	// if (!MatchedTOdo) {
	// 	return res.status(404).send();
	// }

	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// }else if (body.hasOwnProperty('completed')) {
	// 	return res.status(400).send();
	// }

	
	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {

	// 	//body.description = body.description.trim();
	// 	validAttributes.description = body.description;
	// }else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }

	// _.extend(MatchedTOdo, validAttributes);

	// res.json(MatchedTOdo);

});

// post /users
app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user){
		res.json(user.toPublicJSON());
	},function (e){
		res.status(400).json(e);
	});
});

//post /users/login

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user){
		var token = user.generateToken('authentication') ;

		if (token) {
			res.header('Auth', token ).json(user.toPublicJSON());
		}else{
			res.status(401).send();	
		}
		
	},function (e){
		res.status(401).send();
	});
	// if (typeof body.email !== 'string' || typeof body.password !== 'string'){
	// 	return res.status(400).send();
	// }

	// db.user.findOne({
	// 	where: {
	// 		email: body.email
	// 	}
	// }).then (function (user){
	// 	if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
	// 		 return res.status(401).send();
	// 	}



	// 	res.json(user.toPublicJSON());
	// },function (e){
	// 	res.status(500).send();
	// });
	//res.json(body);
});

db.sequelize.sync().then(function(){
	app.listen(PORT, function(){
	console.log("express server started!");
});

});

 