import { useEffect, useState } from 'react';
import './api/waltti/route.tsx';
import './App.css';
import { GET, WALTTI_ENDPOINT } from './api/waltti/route.tsx';

function TopBar() {
  return (
    <header className="top-bar">
      <h1>GTFS Map</h1>
    </header>
  );
}

function App() {
  const [data, setData] = useState<any>(null); // State for storing fetched data
  const [error, setError] = useState<string | null>(null); // State for handling errors
  const [loading, setLoading] = useState<boolean>(true); // State for handling loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GET(new Request(WALTTI_ENDPOINT));
        setData(result); // Update state with fetched data
      } catch (err: any) {
        setError(err.message || "Failed to fetch WALTTI data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <TopBar />
      <main>
        {loading && <p>Loading data...</p>}
        {error && <p>Error: {error}</p>}
        {data ? (
          <div>
            <h2>Fetched Data:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre> {/* Display raw data */}
          </div>
        ) : (
          !loading && <p>No data available</p>
        )}
      </main>
    </div>
  );
}

export default App;
