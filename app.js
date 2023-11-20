const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log(`Server running at http://locahost:3000`);
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(moviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const newMovie = request.body;
  const { directorId, movieName, leadActor } = newMovie;
  const createMovieQuery = `
  INSERT INTO
  movie (director_id, movie_name, lead_actor)
  VALUES
  (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  );
  `;
  await db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
        * 
    FROM 
        movie
    WHERE movie_id = ${movieId};
  `;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  console.log(movieDetails);
  const updateQuery = `
  UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};
  `;
  await db.run(updateQuery);
  response.send(`Movie Details Updated`);
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
  `;
  await db.run(deleteMovieQuery);
  response.send(`Movie Removed`);
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT * FROM director;

    `;
  const directorsList = await db.all(getDirectorsQuery);
  console.log(directorsList);
  response.send(
    directorsList.map((eachObject) =>
      convertDirectorDbObjectToResponseObject(eachObject)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `
  SELECT movie_name FROM movie WHERE director_id = ${directorId};
  `;
  const movieNamesList = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
