//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://allen_the_one1:lo4x83RZcCfjQUC0@cluster0.xoskm.mongodb.net/todolistDB" , {useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false); //to avoid deprecation warning

const itemsSchema = new mongoose.Schema({
name : String
}); 

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
name : "Welcome to the todolist!"
});

const item2 = new Item({
name : "Hit + to add a new item."
});

const item3 = new Item({
name : "<-- Hit this to delete an item."
});

const defaultArray = [item1 ,  item2 , item3];

const listSchema = {
  name : String,
  items :[itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/", function(req, res) {

  Item.find({} , function(err , foundItems){

if(foundItems.length === 0){
  Item.insertMany( defaultArray , function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully added the defaultArray.")
    }
    });
}else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  });
});

app.get("/:customListName" , function(req,res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName} , function(err , foundList){
if(!err){
  if(!foundList){

    //Create a new list
const list = new List({
  name: customListName,
  items: defaultArray
  });

  list.save();
res.redirect("/" + customListName);
  }else{
    //show an existing list
    res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
}
}
});
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName} , function(err,foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/"+listName);
    });
  }
 
});

app.post("/delete" , function(req,res){
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

if(listName==="Today"){

  Item.findByIdAndRemove(checkedItemId , function(err){
  
  if(!err){
    console.log("Successfully deleted the checked item(s).")
    res.redirect("/");
  }
   });
}else{
List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}} , function(err,foundList){
if(!err){
  res.redirect("/" + listName);
}
});
}
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Serverhas started successfully");
});
