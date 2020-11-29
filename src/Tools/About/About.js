
import logoWebp from "../../img/logo.webp";
import logoPng from "../../img/logo.png";

import "./About.css"

const About = () => (
  <div className="about">
    <div className="welcome-title">
      <div className="welcome-big-title">
        <img
          className="logo"
          alt="o7map logo"
          src={logoWebp}
          onError={(e) => { e.target.onerror = null; e.target.src = logoPng }}
        ></img>
        <h1>o7Map</h1>
      </div>
      <h2><em>The collaborative Map for Eve Echoes</em></h2>
      <div className="separator"></div>
    </div>

    <div className="about-developers">
      <h3>Developers</h3>
      <p>Kalad <strong>&lt;o7@pedro.to&gt;</strong> <em>(Kalad in-game)</em></p>
    </div>

    <div className="about-thanks">
      <h3>Thanks</h3>
      <div className="about-thanks-item">
        <p>Risingson from <a href="https://eveeye.com" target="_blank" rel="nofollow noopener noreferrer">EVEEYE.com</a></p>
        <small>For being helpful, open, collaborative and offering guidance and his coordinates from <a href="https://echoes.eveeye.com" target="_blank" rel="nofollow noopener noreferrer">EVEEYE</a> which were very useful during the initial development stage</small>
      </div>
    </div>
  </div>
);

export default About;