const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config()
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const User = require('./src/models/user');
const Bill = require('./src/models/addbills');
const Iteam = require('./src/models/additeam');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000' // Replace with your frontend URL
}));
app.use(express.json());

const uri = `{process.env.MONGO_URL}`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to MongoDB');
  })
  .catch(err => {
    console.error('Connection error', err);
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "sessions" }),
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  }
});

// Event: QR code received - generate and display it in the terminal
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

// Event: Client is ready
client.on('ready', async () => {
  console.log('Client is ready!');
});

// Event: Message received
client.on('message', async message => {
  // Check if the received message is "hi"
  if (message.body.toLowerCase() === 'hi') {
    // Send a reply
    await message.reply('hello');
    console.log(`Replied to ${message.from} with "hello"`);
  }
});

// Event: Message acknowledgment received
client.on('message_ack', (message, ack) => {
  if (ack === 3) {
    console.log(`Message ${message.id.id} was read.`);
  }
});

// Initialize the client
client.initialize();

app.post('/user', async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.status(201).send(result);
    console.log(`New user inserted with _id: ${result._id}`);
  } catch (err) {
    res.status(400).send(err);
    console.error('Error inserting user', err);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
    console.log('All Users:', users);
  } catch (err) {
    res.status(500).send(err);
    console.error('Error retrieving users', err);
  }
});

app.post('/addbill', async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    console.log(newBill.mobileNumber)
    const savedBill = await newBill.save();
    res.status(201).send(savedBill);
  } catch (error) {
    res.status(500).send(error);
  }
});
let mobileNo;
app.get('/addbills', async (req, res) => {
  try {
    const newBills = await Bill.find().limit(1).sort({ $natural: -1 });
    console.log(newBills)
  mobileNo =  newBills[0].mobileNumber
  console.log(mobileNo)
    res.status(200).send(newBills);
    console.log('All Users:', newBills);
  } catch (err) {
    res.status(500).send(err);
    console.error('Error retrieving users', err);
  }
});

app.get('/allbills', async (req, res) => {
  try {
    const newBills = await Bill.find();
    res.status(200).send(newBills);
    console.log('All Users:', newBills);
  } catch (err) {
    res.status(500).send(err);
    console.error('Error retrieving users', err);
  }
});

app.post('/additeam', async (req, res) => {
  try {
    const newIteam = new Iteam(req.body);
    const savedIteam = await newIteam.save();
    res.status(201).send(savedIteam);
    console.log(`New user inserted with _id: ${savedIteam._id}`);

  } catch (error) {
    res.status(500).send(error);
  }
});


app.get('/allitemas', async (req, res) => {
  try {
    const newIteam = await Iteam.find();
    res.status(200).send(newIteam);
    console.log('All Users:', newIteam);
  } catch (err) {
    res.status(500).send(err);
    console.error('Error retrieving users', err);
  }
});

app.post('/send-pdf', upload.single('invoice'), async (req, res) => {
  try {
    console.log(mobileNo)
    const phoneNumber = `91${mobileNo}@c.us`; // replace with your recipient's phone number
    const media = MessageMedia.fromFilePath(req.file.path);

    // Send the media file to the specified number
    await client.sendMessage(phoneNumber, media);
    console.log(`Invoice sent to ${phoneNumber}`);
    res.status(200).send({ message: 'Invoice sent via WhatsApp' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to send invoice via WhatsApp' });
    console.error('Error sending invoice via WhatsApp', error);
  }
});





const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
