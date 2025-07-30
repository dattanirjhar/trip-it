import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Container, Row, Col, Card, Form, Button, Accordion, Spinner, Alert } from 'react-bootstrap';
import L from 'leaflet';

// --- UI STYLES ---
const GlobalStyles = () => (
  <style type="text/css">{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    /* High-Contrast Monochrome Dark Color Scheme */
    :root {
      --header-bg: #040404; --sidebar-bg: #1c1c1c; --card-bg: #4c4c4c; --accent-color: #6f6f6f; --accent-hover: #ececec; --sidebar-text: #ececec; --border-color: #4c4c4c; --body-bg: #040404;
    }
    html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; font-family: 'Nunito', sans-serif; background-color: var(--body-bg); font-size: 16px; }
    #root { max-width: 100%; text-align: left; }
    .app-container { display: flex; flex-direction: column; height: 100vh; width: 100%; }
    .app-header { background-color: var(--header-bg); color: var(--sidebar-text); padding: 0.75rem 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); z-index: 10; border-bottom: 1px solid var(--card-bg); }
    .app-header h1 { font-size: 1.85rem; font-weight: 800; letter-spacing: 0.05em; }
    .content-wrapper { flex-grow: 1; overflow: hidden; position: relative; /* Added for stacking context */ }
    .sidebar { height: 100%; overflow-y: auto; background-color: var(--sidebar-bg); color: var(--sidebar-text); border-right: 1px solid var(--border-color); transition: transform 0.3s ease-in-out; padding: 1.5rem; }
    .sidebar .card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 0.5rem; }
    .sidebar .card .card-title { font-size: 1.3rem; font-weight: 700; color: var(--sidebar-text); }
    .sidebar .form-label { font-weight: 600; color: var(--sidebar-text); font-size: 0.9rem; }
    .sidebar .form-control { background-color: var(--sidebar-bg); color: var(--sidebar-text); border: 1px solid var(--border-color); border-radius: 0.375rem; }
    .sidebar .form-control::placeholder { color: #9CA3AF; }
    .sidebar .form-control:focus { background-color: var(--sidebar-bg); color: var(--sidebar-text); border-color: var(--accent-color); box-shadow: 0 0 0 0.25rem rgba(156, 163, 175, 0.25); }
    .sidebar .btn-primary { background-color: var(--accent-color); border-color: var(--accent-color); color: var(--header-bg); font-weight: 700; width: 100%; padding: 0.75rem; border-radius: 0.375rem; transition: background-color 0.2s, color 0.2s; }
    .sidebar .btn-primary:hover { background-color: var(--accent-hover); border-color: var(--accent-hover); color: var(--header-bg); }
    .sidebar .btn-primary:disabled { background-color: #4B5563; border-color: #4B5563; color: #9CA3AF; }
    .itinerary-title { font-size: 1.2rem; font-weight: 700; color: var(--sidebar-text); }
    .sidebar .accordion, .sidebar .accordion-item { background-color: transparent; border: none; color: var(--sidebar-text); }
    .sidebar .accordion-item { margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; background-color: var(--card-bg); }
    .sidebar .accordion-header button { background-color: var(--card-bg); color: var(--sidebar-text); font-weight: 700; font-size: 1.05rem; }
    .sidebar .accordion-header button:not(.collapsed) { background-color: var(--accent-color); color: var(--header-bg); }
    .sidebar .accordion-body { background-color: var(--sidebar-bg); padding: 1rem; }
    .sidebar .accordion-body .card { background-color: var(--sidebar-bg); border: none; }
    .sidebar .accordion-body .card-title { font-size: 1.05rem; font-weight: 700; color: var(--sidebar-text); }
    .sidebar .accordion-body .card-subtitle { font-size: 0.8rem; color: #D1D5DB; }
    .sidebar .accordion-body .card-text { font-size: 0.875rem; font-weight: 400; color: var(--sidebar-text); }
    .map-column { height: 100%; position: relative; }
    .leaflet-container { background: #111827; }
    @media (max-width: 991.98px) { .sidebar { position: absolute; top: 0; left: 0; width: 85%; max-width: 380px; z-index: 1020; transform: translateX(-100%); box-shadow: 0 0 25px rgba(0,0,0,0.3); } .sidebar.visible { transform: translateX(0); } }
    
    /* Animation Keyframes */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    /* Sleek Mobile Button Styles */
    .mobile-fab { /* Floating Action Button */
      position: absolute; /* Changed to absolute to stay within content-wrapper */
      z-index: 1030; /* **FIX**: Increased z-index to be above the sidebar */
      background-color: white;
      color: black;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      animation: fadeIn 0.3s ease-in-out;
    }
    .mobile-open-button {
      top: 15px;
      left: 15px;
    }
    .mobile-close-button {
      top: 15px;
      right: 15px;
    }
  `}</style>
);

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- MAP HELPER COMPONENT ---
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// --- MAIN APP COMPONENT ---
function App() {
  const [itinerary, setItinerary] = useState(null);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [interests, setInterests] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const stadiaApiKey = import.meta.env.VITE_STADIA_API_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination) {
      setError("Please enter a destination.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setItinerary(null);

    const backendUrl = '/api/generate';

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, duration, interests })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Backend Server Error:", responseData);
        throw new Error(responseData.error || `Request failed with status ${response.status}`);
      }
      
      if (responseData.candidates && responseData.candidates.length > 0) {
        const rawText = responseData.candidates[0].content.parts[0].text;
        
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
          throw new Error("The AI response did not contain a valid JSON object.");
        }

        const jsonString = rawText.substring(startIndex, endIndex + 1);
        
        try {
            const newItinerary = JSON.parse(jsonString);
            setItinerary(newItinerary);
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, "--- Raw Text:", rawText);
            throw new Error("Failed to parse the itinerary from the AI response. See console for details.");
        }

      } else {
        console.error("API response missing candidates:", responseData);
        throw new Error("The AI did not return a valid itinerary. This might be due to a safety filter. Please adjust your input and try again.");
      }

    } catch (err) {
      console.error("handleSubmit Error:", err);
      setError(err.message || "An unknown error occurred. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }

    if (window.innerWidth < 992) {
      setSidebarVisible(true);
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
                    <Button variant="primary" type="submit" disabled={isLoading}>
                      {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Generating...</> : 'Generate Itinerary'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
              
              {error && <Alert variant="danger">{error}</Alert>}

              {itinerary && (
                <>
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
                </>
              )}
            </Col>

            {/* Right Panel: Interactive Map */}
            <Col lg={8} xs={12} className="map-column">
              {/* Mobile Buttons with conditional rendering for animations */}
              {!isSidebarVisible && (
                <Button 
                  className="d-lg-none mobile-fab mobile-open-button" 
                  onClick={() => setSidebarVisible(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </Button>
              )}
              {isSidebarVisible && (
                 <Button 
                  className="d-lg-none mobile-fab mobile-close-button"
                  onClick={() => setSidebarVisible(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </Button>
              )}

              <MapContainer center={itinerary?.center || [48.8566, 2.3522]} zoom={itinerary ? 13 : 8} style={{ height: '100%', width: '100%' }}>
                {itinerary && <ChangeView center={itinerary.center} zoom={13} />}
                <TileLayer
                  url={`https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png?api_key=${stadiaApiKey}`}
                  attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {itinerary?.days.flatMap(day => day.locations).map((location, index) => (
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

