// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';

const App = () => {
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [error, setError] = useState('');

  // Fungsi untuk mencari anime berdasarkan judul
  const searchAnime = async (e) => {
    e.preventDefault();
    setError(''); // Reset error sebelum melakukan pencarian
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
      if (!response.ok) {
        throw new Error('Anime tidak ditemukan');
      }
      const data = await response.json();
      setAnimeList(data.data); // Jikan API memberikan data array
    } catch (error) {
      console.error('Error fetching the anime data:', error);
      setError(error.message);
      setAnimeList([]);
    }
  };

  // Fungsi untuk mengambil daftar anime populer (10 anime pertama)
  const fetchPopularAnime = async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
      const data = await response.json();
      setAnimeList(data.data);
    } catch (error) {
      console.error('Error fetching the popular anime data:', error);
    }
  };

  // Mengambil daftar anime saat komponen pertama kali dirender
  useEffect(() => {
    fetchPopularAnime();
  }, []);

  const handleShow = (anime) => {
    setSelectedAnime(anime);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Container>
      <h1 className="my-4 text-center">Cari Anime</h1>
      <Form onSubmit={searchAnime}>
        <Form.Group className="mb-3" controlId="animeSearch">
          <Form.Control
            type="text"
            placeholder="Cari Anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Cari
        </Button>
      </Form>

      {/* Menampilkan pesan error jika ada */}
      {error && <p className="text-danger text-center mt-3">{error}</p>}

      {/* Daftar Anime */}
      <Row className="mt-4">
        {animeList.map((anime, index) => (
          <Col md={4} key={anime.mal_id || index} className="mb-4">
            <Card className="anime-card" onClick={() => handleShow(anime)} style={{ cursor: 'pointer' }}>
              <Card.Img
                variant="top"
                src={anime.images.jpg.image_url}
                alt={anime.title}
              />
              <Card.Body>
                <Card.Title className="anime-title">{anime.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal untuk Menampilkan Detail Anime */}
      {selectedAnime && (
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedAnime.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={selectedAnime.images.jpg.image_url}
              alt={selectedAnime.title}
              className="img-fluid mb-3"
            />
            <p>Episodes: {selectedAnime.episodes}</p>
            <p>Score: {selectedAnime.score}</p>
            <p>Type: {selectedAnime.type}</p>
            <p>Synopsis: {selectedAnime.synopsis || 'No synopsis available.'}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default App;
