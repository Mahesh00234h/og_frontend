import React from 'react';
import './Smallloader.css';

const SmallLoader: React.FC = () => {
  return (
    <div className="small-loader-container">
      <div className="small-logo-wrapper">
        <img
          src="https://res.cloudinary.com/dxu2xavnq/image/upload/v1750839403/favicon_bcvqnp.png"
          alt="Small Logo"
        />
      </div>
      <div className="small-loader"></div>
    </div>
  );
};

export default SmallLoader;
