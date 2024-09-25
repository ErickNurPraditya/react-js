// Footer.jsx
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import './Footer.css'; // Import CSS untuk styling footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
        Welcome to My Recipe! We are a platform dedicated to all the foodies out there. Here, you can find a variety of easy-to-follow recipes, from everyday meals to special dishes for celebrations.        </p>
        <div className="social-icons">
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <FaWhatsapp />
          </a>
          <a href="https://instagram.com/username" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="mailto:email@example.com" aria-label="Email">
            <FaEnvelope />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MyRecipe. All Rights Reserved.</p>
        
        <img src="src/pikaso_embed (3).png" alt="image" />
      
      </div>
      
    </footer>
  );
};

export default Footer;
