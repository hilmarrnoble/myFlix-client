import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';

const movies = [
  {
    id: 1,
    title: "The Matrix",
    description: "A computer hacker learns about the true nature of his reality.",
    image: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
    genre: "Sci-Fi",
    director: "The Wachowskis"
  },
  {
    id: 2,
    title: "Inception",
    description: "A thief steals corporate secrets through dream-sharing technology.",
    image: "http://www.impawards.com/2010/posters/inception_ver2.jpg",
    genre: "Sci-Fi",
    director: "Christopher Nolan"
  },
  {
    id: 3,
    title: "Interstellar",
    description: "A team travels through a wormhole in space to ensure humanity's survival.",
    image: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
    genre: "Sci-Fi",
    director: "Christopher Nolan"
  }
];

const MovieCard = ({ movie, onMovieClick }) => (
  <div
    style={{
      border: '1px solid #ccc',
      padding: '10px',
      margin: '10px',
      cursor: 'pointer',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}
    onClick={() => onMovieClick(movie)}
  >
    <h3>{movie.title}</h3>
  </div>
);

const MovieView = ({ movie, onBackClick }) => (
  <div style={{ padding: '20px' }}>
    <h2>{movie.title}</h2>
    <img src={movie.image} alt={movie.title} style={{ width: '200px', borderRadius: '8px' }} />
    <p><strong>Description:</strong> {movie.description}</p>
    <p><strong>Genre:</strong> {movie.genre}</p>
    <p><strong>Director:</strong> {movie.director}</p>
    <button onClick={onBackClick}>Back</button>
  </div>
);

const MainView = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return selectedMovie ? (
    <MovieView movie={selectedMovie} onBackClick={() => setSelectedMovie(null)} />
  ) : (
    <div>
      <h1>MyFlix Movie List</h1>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} onMovieClick={setSelectedMovie} />
      ))}
    </div>
  );
};

const MyFlixApplication = () => {
  return (
    <div className="my-flix">
      <MainView />
    </div>
  );
};

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<MyFlixApplication />);
