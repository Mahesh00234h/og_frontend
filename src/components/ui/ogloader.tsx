
import React from 'react';
import './ogloader.css';

const OGLoader = () => {
  return (
    <div className="loader-container">
      <div className="logo-wrapper">
        <img
          src="https://res.cloudinary.com/dxu2xavnq/image/upload/v1750839403/favicon_bcvqnp.png"
          alt="OG Logo"
        />
      </div>
      <div className="loader"></div>
    </div>
  );
};

export default OGLoader;
