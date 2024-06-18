const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const users = {};
const exercises = {};

require('dotenv').config()

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const user = req.body.username;
  const id = String(Object.entries(users).length + 1);
  users[id] = {username: user, _id: id};
  res.json(users[id]);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users[req.params._id];
  const date = (req.params.date) ? new Date(req.params.date) : new Date();
  const exercise = {description: req.body.description, duration: parseInt(req.body.duration), date: date.toDateString()}
  
  if (exercises[user._id] === undefined) {
    exercises[user._id] = []; 
  }

  exercises[user._id].push(exercise);
  user.description = req.body.description;
  user.duration = parseInt(req.body.duration);
  user.date = date.toDateString();

  res.json(user);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const user = users[req.params._id];
  const userExercises = exercises[user._id];
  
  if (req.query.from != undefined && req.query.to != undefined) {
    const userExercisesFiltered = [];
    const fromFilter = new Date(req.query.from + "00:00:00");
    const toFilter = new Date(req.query.to + "00:00:00");
    
    if (isNaN(req.query.limit) && req.query.limit != undefined) {
      res.json({error: "limit is not a number"});
    }
    
    const limitExercises = (req.query.limit != undefined) ? req.query.limit : userExercises.length;
    userExercises.forEach(exercise => {
      const exerciseDate = new Date(exercise.date);
      if (exerciseDate.getTime() > fromFilter.getTime() && exerciseDate.getTime() < toFilter.getTime()) {
        if (userExercisesFiltered.length < limitExercises) {
          userExercisesFiltered.push(exercise);
        }
      }
    });

    res.json({username: user.username, _id: user._id, count: userExercises.length, log: userExercisesFiltered});
  } else {
    if (isNaN(req.query.limit) && req.query.limit != undefined) {
      res.json({error: "limit is not a number"});
    }
    
    const limitExercises = (req.query.limit != undefined) ? req.query.limit : userExercises.length;
    res.json({username: user.username, _id: user._id, count: userExercises.length, log: userExercises.slice(0,limitExercises)});
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});