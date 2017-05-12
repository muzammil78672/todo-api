var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
var todos = [{
	id: 1,
	description : 'meet mom for lunch',
	complete: false
},{
	id: 2,
	description: 'go to market',
	complete: false
},{
	id: 3,
	description: 'go to meeting',
	complete: true
}];


app.get('/', function(req, res){
	res.send("Todo API Root!");
});

app.get('/todos', function (req, res){
	res.json(todos);
});

app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var x ;
	todos.forEach(function (todo){
		if(todoId === todo.id){
			x = todo;
		}
	});		if (x) {
			res.json(x)
		}else{
			res.status(404).send();
		}

		if (x) {
			res.json(x);
		}else{
			res.status(404).send();
		}



	//res.send('Asking for id : ' + req.params.id);

});



app.listen(PORT, function(){
	console.log("express server started!");
}); 