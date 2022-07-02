import React, { useState} from "react";

const NotConnected = () => {
  return (
    <section className="hero is-large">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1>
            <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
              <i className="fas fa-plug"></i>
            </span>
          </h1>
          <p className="title">
            Connect your wallet
          </p>
          <p className="subtitle">
            Do not have Nami Wallet? <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">Download</a> now!
          </p>
        </div>
      </div>
    </section>
  )
}

export default NotConnected;
