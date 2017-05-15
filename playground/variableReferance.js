var person = {
	name : 'abc',
	age: 20
};
function updatePerson(obj){
	// obj = {
	// 	age: 25
	// };
obj.age = 25;

}

updatePerson(person);
console.log(person);


var grades = [80, 90];

function addGrades (arr){
	arr.push(100);

	debugger ;

	arr = [100, 80, 64];
}

addGrades(grades);
console.log(grades);