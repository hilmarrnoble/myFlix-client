import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";

export const MovieCard = ({ movie }) => {
  const poster =
    movie.imageURL || "https://via.placeholder.com/300x450?text=No+Image";
  return (
    <Card
      as={Link}
      to={`/movies/${movie._id}`}
      className="mb-3 text-decoration-none flex-fill shadow-sm"
    >
      <Card.Img variant="top" src={poster} alt={movie.title} />
      <Card.Body>
        <Card.Title className="text-white h6 mb-1">{movie.title}</Card.Title>
        <Card.Text className="small text-muted mb-0">{movie.genre?.name}</Card.Text>
      </Card.Body>
    </Card>
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
