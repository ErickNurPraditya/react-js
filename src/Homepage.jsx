// src/components/Homepage.js
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Container,   } from 'react-bootstrap';
import './Homepage.css'; // Pastikan file ini sesuai dengan CSS yang kita buat

const Homepage = () => {
  return (
    <>
      
      <Container className="text-center mt-5">
      <img
        src="/src/pikaso_embed (1).png" // Ganti dengan URL atau path lokal gambar kamu
        alt="Logo"
        width="40" // Sesuaikan ukuran gambar
        height="45" // Sesuaikan ukuran gambar
        className="d-inline-block align-top"
      />
        <h1>MyRecipe</h1>
       
      </Container>
    </>
  );
};

export default Homepage;
