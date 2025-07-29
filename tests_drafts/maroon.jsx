import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Container, Row, Col, Card, Form, Button, Accordion } from 'react-bootstrap';
import L from 'leaflet';

// Custom CSS for a modern, responsive layout and styling
const GlobalStyles = () => (
  <style type="text/css">{`
    /* Import a modern, rounded font */
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    /* Define color variables from the new palette */
    :root {
      --header-bg: #594545;
      --sidebar-bg: #815B5B;
      --card-bg: #594545;
      --accent-color: #9E7676;
      --accent-hover: #815B5B;
      --sidebar-text: #FFF8EA;
      --border-color: #815B5B;
      --body-bg: #f1f5f9;
    }

    /* Global styles */
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Nunito', sans-serif;
      background-color: var(--body-bg);
      font-size: 16px;
    }

    #root {
      max-width: 100%;
      text-align: left;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
    }
    
    .app-header {
      background-color: var(--header-bg);
      color: white;
      padding: 0.75rem 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    
    .app-header h1 {
        font-size: 1.85rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: var(--sidebar-text);
    }

    .content-wrapper {
      flex-grow: 1;
      overflow: hidden;
    }

    /* Sidebar styles */
    .sidebar {
      height: 100%;
      overflow-y: auto;
      background-color: var(--sidebar-bg);
      color: var(--sidebar-text);
      border-right: 1px solid var(--border-color);
      transition: transform 0.3s ease-in-out;
      padding: 1.5rem;
    }
    
    .sidebar .card {
      background-color: var(--card-bg);
      border: none;
      border-radius: 0.5rem;
    }
    
    .sidebar .card .card-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--sidebar-text);
    }

    .sidebar .form-label {
      font-weight: 600;
      color: var(--sidebar-text);
      font-size: 0.9rem;
    }

    .sidebar .form-control {
      background-color: var(--sidebar-bg);
      color: white;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
    }
    .sidebar .form-control::placeholder {
      color: #FFF8EA;
      opacity: 0.7;
    }
    .sidebar .form-control:focus {
      background-color: var(--sidebar-bg);
      color: white;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 0.25rem rgba(158, 118, 118, 0.25);
    }
    
    .sidebar .btn-primary {
      background-color: var(--accent-color);
      border-color: var(--accent-color);
      color: var(--sidebar-text);
      font-weight: 700;
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s, color 0.2s;
    }
    .sidebar .btn-primary:hover {
      background-color: var(--accent-hover);
      border-color: var(--accent-hover);
      color: var(--sidebar-text);
    }

    /* Itinerary Title */
    .itinerary-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--sidebar-text);
    }

    /* Accordion styles */
    .sidebar .accordion, .sidebar .accordion-item {
      background-color: transparent;
      border: none;
      color: var(--sidebar-text);
    }
    .sidebar .accordion-item {
      margin-bottom: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;
      background-color: var(--card-bg);
    }
    .sidebar .accordion-header button {
      background-color: var(--card-bg);
      color: var(--sidebar-text);
      font-weight: 700;
      font-size: 1.05rem;
    }
    .sidebar .accordion-header button:not(.collapsed) {
      background-color: var(--accent-color);
      color: var(--sidebar-text);
    }
    .sidebar .accordion-body {
      background-color: var(--sidebar-bg);
      padding: 1rem;
    }

    /* Styling for the inner cards in the accordion */
    .sidebar .accordion-body .card {
      background-color: var(--sidebar-bg);
    }
    .sidebar .accordion-body .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sidebar-text);
    }
    .sidebar .accordion-body .card-subtitle {
      font-size: 0.8rem;
      color: var(--sidebar-text);
      opacity: 0.8;
    }
     .sidebar .accordion-body .card-text {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--sidebar-text);
    }


    /* Map styles */
    .map-column {
      height: 100%;
      position: relative;
    }
    .leaflet-container {
        background: #0f172a;
    }

    /* Mobile & Tablet specific styles */
    @media (max-width: 991.98px) {
      .sidebar {
        position: absolute;
        top: 0;
        left: 0;
        width: 85%;
        max-width: 380px;
        z-index: 1020;
        transform: translateX(-100%);
        box-shadow: 0 0 25px rgba(0,0,0,0.3);
      }
      .sidebar.visible {
        transform: translateX(0);
      }
    }

    .mobile-toggle-button {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 1001;
      background-color: white;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `}</style>
);

// Mock data
const mockItinerary = {
  destination: "Paris, France",
  duration: 3,
  center: [48.8566, 2.3522],
  days: [
    { day: 1, theme: "Iconic Landmarks & River Views", locations: [{ name: "Eiffel Tower", coords: [48.8584, 2.2945], time: "9:00 AM - 11:00 AM", description: "Start your trip with a visit to the most famous landmark." }, { name: "Seine River Cruise", coords: [48.8580, 2.2980], time: "11:30 AM - 1:00 PM", description: "See the city from a different perspective on a relaxing boat cruise." }, { name: "Louvre Museum", coords: [48.8606, 2.3376], time: "2:00 PM - 5:00 PM", description: "Home to the Mona Lisa, the world's largest art museum." }] },
    { day: 2, theme: "Art, History & Bohemian Charm", locations: [{ name: "Notre-Dame Cathedral", coords: [48.8530, 2.3499], time: "10:00 AM - 11:30 AM", description: "Visit the historic Catholic cathedral on the Île de la Cité." }, { name: "Montmartre", coords: [48.8867, 2.3431], time: "1:00 PM - 4:00 PM", description: "Explore the charming hilltop district and Sacré-Cœur Basilica." }, { name: "Moulin Rouge", coords: [48.8841, 2.3322], time: "8:00 PM - 10:00 PM", description: "Experience the world-famous cabaret for an evening of entertainment." }] },
    { day: 3, theme: "Royal Grandeur & Shopping", locations: [{ name: "Palace of Versailles", coords: [48.8049, 2.1204], time: "9:30 AM - 2:00 PM", description: "Witness the opulence of the French monarchy." }, { name: "Champs-Élysées", coords: [48.8698, 2.3072], time: "3:00 PM - 5:00 PM", description: "Stroll down the famous avenue for luxury shopping." }] },
  ],
};

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function App() {
  const [itinerary, setItinerary] = useState(mockItinerary);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [interests, setInterests] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Generating itinerary for:", { destination, duration, interests });
    alert("Itinerary generation with AI is not yet implemented. Showing mock data for Paris.");
    if (window.innerWidth < 992) {
      setSidebarVisible(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="app-container">
        <header className="app-header text-center">
          <h1>TRIP IT!</h1>
        </header>

        <Container fluid className="content-wrapper">
          <Row className="g-0 h-100">
            {/* Left Panel: Itinerary Details (Sidebar) */}
            <Col lg={4} className={`sidebar d-lg-block ${isSidebarVisible ? 'visible' : ''}`}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title className="mb-3">Plan Your Next Adventure</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Destination</Form.Label>
                      <Form.Control type="text" placeholder="e.g., Tokyo, Japan" value={destination} onChange={(e) => setDestination(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Trip Duration (days)</Form.Label>
                      <Form.Control type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Interests</Form.Label>
                      <Form.Control as="textarea" rows={3} placeholder="e.g., food, history, hiking" value={interests} onChange={(e) => setInterests(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" type="submit">Generate Itinerary</Button>
                  </Form>
                </Card.Body>
              </Card>

              <h4 className="mb-3 mt-4 itinerary-title">{itinerary.destination} - {itinerary.duration} Day Itinerary</h4>
              <Accordion defaultActiveKey="0" alwaysOpen>
                {itinerary.days.map((day, index) => (
                  <Accordion.Item eventKey={index.toString()} key={day.day}>
                    <Accordion.Header>Day {day.day}: {day.theme}</Accordion.Header>
                    <Accordion.Body>
                      {day.locations.map((location, locIndex) => (
                        <Card className="mb-2" key={locIndex}>
                          <Card.Body>
                            <Card.Title>{location.name}</Card.Title>
                            <Card.Subtitle className="mb-2">{location.time}</Card.Subtitle>
                            <Card.Text>{location.description}</Card.Text>
                          </Card.Body>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>

            {/* Right Panel: Interactive Map */}
            <Col lg={8} xs={12} className="map-column">
              <Button 
                className="d-lg-none mobile-toggle-button" 
                onClick={() => setSidebarVisible(!isSidebarVisible)}
              >
                {isSidebarVisible ? 'Hide' : 'Show'} Itinerary
              </Button>
              <MapContainer center={itinerary.center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={itinerary.center} zoom={13} />
                <TileLayer
                  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {itinerary.days.flatMap(day => day.locations).map((location, index) => (
                  <Marker position={location.coords} key={index}>
                    <Popup>
                      <strong>{location.name}</strong><br />
                      {location.description}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default App;

