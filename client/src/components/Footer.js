import React from 'react';
import { Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <span>© {year} SmartNails Stuttgart</span>
        </div>
        <div className="footer-right">
          <a href="https://instagram.com/smartnails_stuttgart" target="_blank" rel="noopener noreferrer" className="footer-instagram">
            <Instagram size={20} /> Instagram
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 