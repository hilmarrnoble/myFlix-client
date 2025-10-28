// src/components/movie-view/movie-view.jsx
import React from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Badge,
  Alert
} from "react-bootstrap";

export const MovieView = ({ movies, user, onToggleFavorite }) => {
  const { id } = useParams();
  const movie = movies.find((m) => m._id === id);

  if (!movie) {
    return (
      <>
        <Alert variant="warning">Movie not found.</Alert>
        <Button as={Link} to="/" variant="outline-secondary">Back</Button>
      </>
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
    <Row className="g-4">
      <Col md={4}>
        <img
          src={movie.imageURL || "https://via.placeholder.com/500x750?text=No+Image"}
          alt={movie.title}
          className="img-fluid movie-poster"
        />
      </Col>
      <Col md={8}>
        <h2 className="mb-3">{movie.title}</h2>
        <p className="text-light">{movie.description}</p>

        <div className="mb-3">
          <Badge bg="primary" className="me-2">
            {movie.genre?.name || "Genre"}
          </Badge>
          <Badge bg="secondary">
            {movie.director?.name || "Director"}
          </Badge>
        </div>

        <div className="d-flex gap-2 mb-3">
          <Button
            variant={isFav ? "danger" : "success"}
            onClick={toggle}
          >
            {isFav ? "Remove from Favorites" : "Add to Favorites"}
          </Button>
          <Button as={Link} to="/" variant="outline-secondary">Back</Button>
        </div>
      </Col>
    </Row>
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
