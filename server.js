var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 8080;
var todos = [];
var todoNextid = 1 ;

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send("Todo API Root!");
});


// To get all todos
app.get('/todos', function (req, res){
	res.json(todos);
});

//to get /todos?completed=true

app.get('/todos', function(req, res){
	var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	}else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo){
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);

});


//To get todos by id 
app.get('/todos/:id', function(req, res){
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
app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
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

app.delete('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);

	var MatchedTOdo = _.findWhere(todos, {id: todoId});

	if (!MatchedTOdo) {
		res.status(404).json({"error": "Requested Id doesn't Found"});
	}else{
		todos = _.without(todos, MatchedTOdo);
		res.json(MatchedTOdo);
	}
});

//To Update todos 

app.put('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	var MatchedTOdo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!MatchedTOdo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	}else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {

		//body.description = body.description.trim();
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(MatchedTOdo, validAttributes);

	res.json(MatchedTOdo);

});

db.sequelize.sync().then(function(){
	app.listen(PORT, function(){
	console.log("express server started!");
});

});

 