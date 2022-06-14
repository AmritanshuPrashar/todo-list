//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://testuser123:testpassword123@todocluster.ro5hs.mongodb.net/todolistDB?retryWrites=true&w=majority", {
    useNewUrlParser: true
});

const itemsSchema = {
    name: {
        type: String
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your ToDo List"
});
const item2 = new Item({
    name: "Hit the + button to add the new Item"
});
const item3 = new Item({
    name: "<-- Hit this to Delete any item"
});
const defaultItems = [item1, item2, item3];




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));



app.get("/", function(req, res) {

    const day = date.getDate();
    Item.find({}, (err, foundItems) => {

        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Inserted Successfully');
                }
            });
            res.redirect("/")
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });

        }

    })



});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list; 
    const item = new Item({
        name: itemName
    });
    if (listName == "Today") {
        item.save();
        res.redirect('/');
    }
    else {
        List.findOne({ name: listName }, (err, foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
         })
    }
});

app.post("/delete", (req, res) => {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    if (listName == "Today") {
        Item.deleteMany({
            _id: checkedItem
        }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Deleted Successfully');
            }
        });
        res.redirect("/");
    }

    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItem } } }, (err, foundList) => {
            if (!err)
            {
                res.redirect("/" + listName);
                }
        });

    }
});


const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        
        res.render("list", { listTitle: customListName, newListItems: foundList.items });
        
      }
    }
  })


});




app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});