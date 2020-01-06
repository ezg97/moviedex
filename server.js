require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./moviedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
//midleware
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());


app.use(function validateBearerToken(req, res, next){
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
  
    if (!authToken || authToken.split(' ')[1] !== apiToken){
      return res.status(401).json({ error: 'Unathorized request'});
    }
        // move to the next middleware
    next();
  });
  
  app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })
  
  //end of middleware
    
  ///////// end points ////////////
  function handleGetMovie(req, res) {

    let response = MOVIEDEX;
    let bool = false;

      if(req.query.genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        );
        bool=true;
      }

      if(req.query.country) {
        response = response.filter(movie =>
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        );
        bool=true;
      }

      if(req.query.avg_vote) {
        response = response.filter(movie =>
            Number(movie.avg_vote) >= Number(req.query.avg_vote)
        );
        bool=true;
      }

      if(bool){
        res.json(response);
      }
      res.send('Please enter a query');
  }
  
  app.get('/movie', handleGetMovie);
  
  
  
  const PORT = process.env.PORT || 8000;
  
  app.listen(PORT, () => {
    //console.log(`Server listening at http://localhost:${PORT}`)
  })
