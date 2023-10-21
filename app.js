const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let dbObject = null;

const initializeDBAndServer = async () => {
  try {
    dbObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
            *
        FROM 
        movie;`;
  const movies = await dbObject.all(getMoviesQuery);
  response.send(movies);
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
     movie (director_id, movie_name, lead_actor)
    VALUES
    (
        ${directorId},
        ${movieName},
        ${leadActor},
    );`;
  const dbResponse = await dbObject.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT 
    *
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};`;
  const movie = await dbObject.get(getMovieQuery);
  response.send(movie);
});

//API 4

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
    movie
    SET 
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor}
    WHERE
    movie_id = ${movieId};`;
  await dbObject.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

module.exports = app;
