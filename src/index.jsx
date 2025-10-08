import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import PropTypes from "prop-types";
import "./index.scss";

// 🎬 MovieCard component
const MovieCard = ({ movie, onMovieClick }) => (
  <div
    style={{
      border: "1px solid #ccc",
      padding: "10px",
      margin: "10px",
      cursor: "pointer",
      borderRadius: "5px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    }}
    onClick={() => onMovieClick(movie)}
  >
    <h3>{movie.Title}</h3>
  </div>
);

MovieCard.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string.isRequired,
    Description: PropTypes.string,
    ImagePath: PropTypes.string,
    Genre: PropTypes.shape({
      Name: PropTypes.string,
      Description: PropTypes.string,
    }),
    Director: PropTypes.shape({
      Name: PropTypes.string,
      Bio: PropTypes.string,
      Birth: PropTypes.string,
    }),
  }).isRequired,
  onMovieClick: PropTypes.func.isRequired,
};

// 🎥 MovieView component
const MovieView = ({ movie, onBackClick }) => (
  <div style={{ padding: "20px" }}>
    <h2>{movie.Title}</h2>
    <img
      src={movie.ImagePath}
      alt={movie.Title}
      style={{ width: "200px", borderRadius: "8px" }}
    />
    <p>
      <strong>Description:</strong> {movie.Description}
    </p>
    <p>
      <strong>Genre:</strong> {movie.Genre?.Name}
    </p>
    <p>
      <strong>Director:</strong> {movie.Director?.Name}
    </p>
    <button onClick={onBackClick}>Back</button>
  </div>
);

MovieView.propTypes = {
  movie: PropTypes.shape({
    Title: PropTypes.string.isRequired,
    Description: PropTypes.string,
    ImagePath: PropTypes.string,
    Genre: PropTypes.object,
    Director: PropTypes.object,
  }).isRequired,
  onBackClick: PropTypes.func.isRequired,
};

// 🧭 MainView — fetches movie data from the API
const MainView = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    // Replace with your deployed Heroku API endpoint
    axios
      .get("https://YOUR-HEROKU-APP-NAME.herokuapp.com/api/movies")
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }, []);

  if (selectedMovie)
    return (
      <MovieView movie={selectedMovie} onBackClick={() => setSelectedMovie(null)} />
    );

  return (
    <div>
      <h1>MyFlix Movie List</h1>
      {movies.length === 0 ? (
        <p>Loading movies...</p>
      ) : (
        movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} onMovieClick={setSelectedMovie} />
        ))
      )}
    </div>
  );
};

// 💡 Root Application
const MyFlixApplication = () => (
  <div className="my-flix">
    <MainView />
  </div>
);

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<MyFlixApplication />);
