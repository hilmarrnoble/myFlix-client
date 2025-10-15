// src/components/movie-view/movie-view.jsx
import React from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";

export const MovieView = ({ movies, user, onToggleFavorite }) => {
  const { id } = useParams();
  const movie = movies.find((m) => m._id === id);

  if (!movie) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Movie not found.</div>
        <Link to="/" className="btn btn-outline-secondary">Back</Link>
      </div>
    );
  }

  const favIds = new Set(
    (user?.favoriteMovies || []).map(x => (typeof x === "string" ? x : x?._id || x))
  );
  const isFav = favIds.has(movie._id);

  const toggle = () => {
    onToggleFavorite && onToggleFavorite(movie._id, !isFav);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-4">
          <img
            src={movie.imageURL || "https://via.placeholder.com/500x750?text=No+Image"}
            alt={movie.title}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-8">
          <h2 className="mb-3">{movie.title}</h2>
          <p className="text-light">{movie.description}</p>

          <div className="mb-3">
            <span className="badge text-bg-primary me-2">
              {movie.genre?.name || "Genre"}
            </span>
            <span className="badge text-bg-secondary">
              {movie.director?.name || "Director"}
            </span>
          </div>

          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn ${isFav ? "btn-danger" : "btn-success"}`}
              onClick={toggle}
            >
              {isFav ? "Remove from Favorites" : "Add to Favorites"}
            </button>
            <Link to="/" className="btn btn-outline-secondary">Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

MovieView.propTypes = {
  movies: PropTypes.arrayOf(MovieProp()).isRequired,
  user: PropTypes.object,
  onToggleFavorite: PropTypes.func
};

// helper to reuse shape
function MovieProp() {
  return PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageURL: PropTypes.string,
    genre: PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string
    }),
    director: PropTypes.shape({
      name: PropTypes.string,
      bio: PropTypes.string,
      birthYear: PropTypes.number
    }),
    releaseYear: PropTypes.number
  });
}
