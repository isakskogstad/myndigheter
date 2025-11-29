import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedMyndighet, setSelectedMyndighet] = useState(null);

  const myndigheter = [
    {
      id: 1,
      namn: 'Skatteverket',
      beskrivning: 'Ansvarar för beskattning, folkbokföring och delar av fastighetsregistret.',
      webbplats: 'https://www.skatteverket.se'
    },
    {
      id: 2,
      namn: 'Försäkringskassan',
      beskrivning: 'Handlägger den svenska socialförsäkringen.',
      webbplats: 'https://www.forsakringskassan.se'
    },
    {
      id: 3,
      namn: 'Arbetsförmedlingen',
      beskrivning: 'Hjälper arbetssökande att hitta arbete och arbetsgivare att hitta personal.',
      webbplats: 'https://www.arbetsformedlingen.se'
    },
    {
      id: 4,
      namn: 'Polisen',
      beskrivning: 'Arbetar för att minska brottsligheten och öka tryggheten i samhället.',
      webbplats: 'https://www.polisen.se'
    },
    {
      id: 5,
      namn: 'Migrationsverket',
      beskrivning: 'Prövar ansökningar från personer som vill bosätta sig i Sverige.',
      webbplats: 'https://www.migrationsverket.se'
    },
    {
      id: 6,
      namn: 'Trafikverket',
      beskrivning: 'Ansvarar för långsiktig planering av transportsystemet.',
      webbplats: 'https://www.trafikverket.se'
    }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Svenska Myndigheter</h1>
        <p>En översikt över viktiga svenska myndigheter</p>

        <div className="myndigheter-container">
          {myndigheter.map((myndighet) => (
            <div
              key={myndighet.id}
              className="myndighet-card"
              onClick={() => setSelectedMyndighet(myndighet)}
            >
              <h3>{myndighet.namn}</h3>
              <p className="beskrivning">{myndighet.beskrivning}</p>
              {selectedMyndighet?.id === myndighet.id && (
                <a
                  href={myndighet.webbplats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="webbplats-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Besök webbplats →
                </a>
              )}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;