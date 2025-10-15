import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const MovieCard = ({ movie }) => {
  const poster =
    movie.imageURL || "https://via.placeholder.com/300x450?text=No+Image";
  return (
    <div className="col-sm-6 col-md-4 col-lg-3 d-flex">
      <Link to={`/movies/${movie._id}`} className="card mb-4 text-decoration-none flex-fill shadow-sm">
        <img src={poster} className="card-img-top" alt={movie.title} />
        <div className="card-body">
          <h5 className="card-title text-white">{movie.title}</h5>
          <p className="card-text small text-muted mb-0">{movie.genre?.name}</p>
        </div>
      </Link>
    </div>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
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
  }).isRequired
};
