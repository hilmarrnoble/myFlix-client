import React from "react";
import PropTypes from "prop-types";
import { MovieCard } from "../movie-card/movie-card.jsx";
import {
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert
} from "react-bootstrap";

export const MainView = ({ movies, isLoading, query, onQuery, onLogout }) => {
  return (
    <>
      <Row className="align-items-center gy-2 mb-3">
        <Col xs="auto">
          <h1 className="h3 mb-0">Movies</h1>
        </Col>
        <Col sm={6} md={5} lg={4} className="ms-auto">
          <Form.Control
            type="search"
            placeholder="Search by title or genre…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Button variant="outline-light" onClick={onLogout}>Log out</Button>
        </Col>
      </Row>

      {isLoading ? (
        <div className="d-flex align-items-center text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading movies…
        </div>
      ) : movies.length === 0 ? (
        <Alert variant="warning">No movies found.</Alert>
      ) : (
        // Responsive grid: 1 / 2 / 3 / 4 cards per row by breakpoint
        <Row className="g-3 g-md-4">
          {movies.map((m) => (
            <Col key={m._id} xs={12} sm={6} md={4} lg={3} className="d-flex">
              <MovieCard movie={m} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

MainView.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  query: PropTypes.string.isRequired,
  onQuery: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};
