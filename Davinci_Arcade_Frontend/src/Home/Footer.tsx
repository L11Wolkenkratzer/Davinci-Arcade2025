import React, { memo } from 'react';

const Footer: React.FC = memo(() => {
  return (
    <footer className="arcade-footer">
      <div className="footer-content">
        <div className="footer-names">
          <span className="footer-text">Livio</span>
          <span className="footer-divider">&amp;</span>
          <span className="footer-text">Gian</span>
          <span className="footer-divider">&amp;</span>
          <span className="footer-text">Philip</span>
        </div>
        <div className="footer-year">ITS 2024</div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 