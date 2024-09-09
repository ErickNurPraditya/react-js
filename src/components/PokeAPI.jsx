// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ProgressBar, Pagination } from 'react-bootstrap';


const App = () => {
  const [query, setQuery] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 30; // Menampilkan 30 Pokémon per halaman

  // Fungsi untuk mengambil daftar Pokémon per halaman
  const fetchPokemon = async (page = 1) => {
    const offset = (page - 1) * pageSize;
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`);
      const data = await response.json();

      // Ambil data detail untuk mendapatkan id dan sprite
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          const detail = await res.json();
          return { ...detail, url: pokemon.url };
        })
      );

      setPokemonList(pokemonDetails);
      setTotalPages(Math.ceil(data.count / pageSize)); // Hitung total halaman
      setError(''); // Reset error jika berhasil
    } catch (error) {
      console.error('Error fetching the Pokémon data:', error);
      setError('Gagal mengambil data Pokémon.');
    }
  };

  // Fungsi untuk mencari Pokémon berdasarkan nama
  const searchPokemon = async (e) => {
    e.preventDefault();
    setError(''); // Reset error sebelum melakukan pencarian
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Pokémon tidak ditemukan');
      }
      const data = await response.json();
      setPokemonList([data]); // Hanya satu hasil, jadi masukkan ke array
      setTotalPages(1); // Hanya ada satu halaman hasil pencarian
      setCurrentPage(1); // Reset halaman ke 1
    } catch (error) {
      console.error('Error fetching the Pokémon data:', error);
      setError('Pokémon tidak ditemukan.');
      setPokemonList([]); // Kosongkan daftar jika tidak ditemukan
    }
  };

  // Mengambil daftar Pokémon saat komponen pertama kali dirender
  useEffect(() => {
    fetchPokemon(currentPage);
  }, [currentPage]);

  // Fungsi untuk mendapatkan evolusi Pokémon
  const fetchEvolutionChain = async (speciesUrl) => {
    try {
      const speciesResponse = await fetch(speciesUrl);
      const speciesData = await speciesResponse.json();
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();
      setEvolutionChain(evolutionData.chain);
    } catch (error) {
      console.error('Error fetching the evolution chain:', error);
    }
  };

  const handleShow = async (pokemon) => {
    try {
      const response = await fetch(pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      const data = await response.json();
      setSelectedPokemon(data);
      await fetchEvolutionChain(data.species.url);
    } catch (error) {
      console.error('Error fetching the Pokémon details:', error);
    }
  };

  // Fungsi untuk menampilkan evolusi Pokémon
  const displayEvolution = (evolution) => {
    const evolutions = [];
    let currentEvolution = evolution;

    while (currentEvolution) {
      evolutions.push(currentEvolution.species.name);
      currentEvolution = currentEvolution.evolves_to[0];
    }

    return evolutions.join(' → ');
  };

  // Fungsi untuk mengubah halaman
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container>
      <div className="header-container d-flex justify-content-between align-items-center my-4">
        <h1>PokéCard</h1>
        <Form onSubmit={searchPokemon} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Cari Pokémon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="pokemonSearch"
            className="me-2"
          />
          <Button variant="primary" type="submit">
            Cari
          </Button>
        </Form>
      </div>

      {/* Menampilkan pesan error jika ada */}
      {error && <p className="text-danger text-center mt-3">{error}</p>}

      <Row className="mt-4">
        <Col md={8}>
          {/* Daftar Pokémon */}
          <Row>
            {pokemonList.map((pokemon, index) => (
              <Col md={4} key={pokemon.id} className="mb-4">
                <Card className="pokemon-card" onClick={() => handleShow(pokemon)} style={{ cursor: 'pointer' }}>
                  <Card.Body className="d-flex align-items-center">
                    <span className="pokemon-number">{index + 1}</span>
                    <Card.Img
                      variant="top"
                      src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="pokemon-image"
                    />
                    <div className="pokemon-info">
                      <Card.Title className="pokemon-title">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Card.Title>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col md={4}>
          {/* Keterangan Pokémon yang dipilih */}
          {selectedPokemon && (
            <div className="pokemon-detail">
              <h3>{selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h3>
              <img
                src={selectedPokemon.sprites.front_default}
                alt={selectedPokemon.name}
                className="img-fluid mb-3"
              />
              <p>Height: {selectedPokemon.height / 10} m</p>
              <p>Weight: {selectedPokemon.weight / 10} kg</p>
              <p>Types: {selectedPokemon.types.map((type) => type.type.name).join(', ')}</p>
              <p>Abilities: {selectedPokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>

              {/* Stats */}
              <h5>Stats:</h5>
              {selectedPokemon.stats.map((stat) => (
                <div key={stat.stat.name} className="pokemon-stats">
                  <p>{stat.stat.name}: {stat.base_stat}</p>
                  <ProgressBar now={stat.base_stat} max={255} label={`${stat.base_stat}`} />
                </div>
              ))}

              {/* Evolution Chain */}
              {evolutionChain && (
                <div className="pokemon-evolution">
                  <h5>Evolution Chain:</h5>
                  <p>{displayEvolution(evolutionChain)}</p>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Pagination */}
      {!query && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 10)}
            disabled={currentPage <= 1} // Disable jika halaman saat ini <= 10
          />

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            const minPage = Math.max(currentPage - 1, 1);
            const maxPage = Math.min(currentPage + 9, totalPages);

            if (pageNumber >= minPage && pageNumber <= maxPage) {
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            }

            return null;
          })}

          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 10)}
            disabled={currentPage + 10 > totalPages} // Disable jika melebihi total halaman
          />
        </Pagination>
      )}
    </Container>
  );
};

export default App;
