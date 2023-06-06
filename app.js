const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();
const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//get movieNames
app.get("/movies/", async (request, response) => {
  const getMovieNames = `
    SELECT movie_name FROM movie;`;
  const movies = await db.all(getMovieNames);
  response.send(
    movies.map((eachMovie) => convertDBObjectToResponseObject(eachMovie))
  );
});

//POST

app.post("/movies/", async (request, response) => {
  const {
    movieId,
    directorId,
    movieName,
    leadActor,
    directorName,
  } = request.body;
  const addMovieQuery = `
    INSERT INTO
      movie (
    director_id,
    movie_name,
    lead_actor,
   )
    VALUES 
    (
    ${directorId},
    '${movieName}',
    ${leadActor});
    `;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieNames = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movies = await db.get(getMovieNames);
  response.send(convertDBObjectToResponseObject(movies));
});

//PUT
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get all
app.get("/directors/", async (request, response) => {
  const directorDetails = `
    SELECT * FROM director;`;
  const director = await db.all(directorDetails);
  response.send(
    director.map((eachDirector) =>
      convertDBObjectToResponseObject(eachDirector)
    )
  );
});

//get all spectific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT movie_name FROM director INNER JOIN movie ON
    director.director_id = movie.director_id
    WHERE director.director_id = ${directorId};`;
  const director = await db.all(getDirectorQuery);
  response.send(
    director.map((eachdirector) =>
      convertDBObjectToResponseObject(eachdirector)
    )
  );
});
module.exports = app;
