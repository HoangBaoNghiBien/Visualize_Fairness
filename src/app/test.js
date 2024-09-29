const editJsonFile = require("edit-json-file");
let file = editJsonFile("/Users/linhvu/Desktop/untitled\ folder/MS_Project_Draft/public/dataset/test.json");
// console.log(file.get());
console.log(file.get())
// i want to test modify a property of a feature
file.set("users.1.age", 32);
console.log(file.get())