 require('dotenv').config()
const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")

const mongodb=require("mongodb")


// const cors=require("cors")


//App Config
const app=express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors(
))

//DB Config
mongoose.connect('mongodb://0.0.0.0:27017/reminderappDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('DB connected prope');
  })
  .catch((error) => {
    console.error('DB connection error:', error);
  });




  //whatsapp reminder functionality

  setInterval(() => {
    Reminder.find({})
      .then(reminderList => {
        reminderList.forEach(reminder => {
          if (!reminder.isReminded) {
            const now = new Date();
            if (new Date(reminder.reminderAt) - now < 0) {
              Reminder.findByIdAndUpdate(reminder._id, { isReminded: true })
                .then(remindObj => {
                  const accountSid = process.env.ACCOUNT_SID;
                  const authToken = process.env.AUTH_TOKEN;
                  const client = require('twilio')(accountSid, authToken);
                  
                  client.messages
                    .create({
                        body: reminder.reminderMsg,
                        from: 'whatsapp:+14155238886',
                        to: 'whatsapp:+916377381458'  //to get notification in you whatsapp firstly you should register you in twilio and join with sandalbox
                    })
                    .then(message => console.log(message.sid))
                    .catch(error => console.error(error));
                })
                .catch(err => {
                  console.log(err);
                });
            }
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }, 1000);
  
  // const accountSid = process.env.ACCOUNT_SID;
  // const authToken = process.env.AUTH_TOKEN;
  // const client = require('twilio')(accountSid, authToken);
  
  // client.messages
  //     .create({
  //         body: 'hiii demo message',
  //         from: 'whatsapp:+14155238886',
  //         to: 'whatsapp:+916377381458'
  //     })
  //     .then(message => console.log(message.sid))
  //     .catch(error => console.error(error));

//for crud op
const reminderSchema=new mongoose.Schema({
     reminderMsg:String,
     reminderAt:String,
     isReminded:Boolean
})

const Reminder=new mongoose.model("reminder",reminderSchema);


//Api route

app.get('/user/create',(req,res)=>{
console.log("glti hogi jo me yaha aayaa")
    res.status(200).send({
        message:"it's working",
        status:200
    })
})

app.get("/getAllReminder", async (req, res) => {
  try {
    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (err) {
    console.log(err);
    // Handle the error appropriately (e.g., send an error response)
  }
});
app.post("/paymentDone",(req,res)=>{
    const body=req.body;
    console.log(body);
    res.send("ok");

})
app.post("/addReminder", async (req, res) => {
  const { reminderMsg, reminderAt } = req.body;

  const reminder = new Reminder({
    reminderMsg,
    reminderAt,
    isReminded: false
  });
  try {
    await reminder.save();
    const reminderList = await Reminder.find({});
    console.log(reminderList); // Add this line
    res.send(reminderList);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding reminder");
  }
});






app.post("/deleteReminder", async (req, res) => {
  try {
    const deletedReminder = await Reminder.findByIdAndDelete(req.body.id);
    if (!deletedReminder) {
      return res.status(404).send("Reminder not found");
    }
    
    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting reminder");
  }
});








// app.get("/",(req,res)=>{
//     res.send("A message from BE")
// })

app.listen(7070, (error) => {
    if (error) {
      console.error('Error starting server:', error);
    } else {
      console.log('BE started');
    }
  });





