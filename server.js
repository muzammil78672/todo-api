var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


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


//To gget todos by id 
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var x = _.findWhere(todos, {id: todoId});
	// var x ;
	// todos.forEach(function (todo){
	// 	if(todoId === todo.id){
	// 		x = todo;
	// 	}
	// });		if (x) {
	// 		res.json(x)
	// 	}else{
	// 		res.status(404).send();
	// 	}

		if (x) {
			res.json(x);
		}else{
			res.status(404).send();
		}

});


//TO create todos
app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextid++;

	todos.push(body);

	res.json(body);
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

app.listen(PORT, function(){
	console.log("express server started!");
}); 