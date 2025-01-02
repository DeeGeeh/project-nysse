
export const WALTTI_ENDPOINT: string = "https://data.waltti.fi";

const VEHICLE_POS: string = "/tampere/api/gtfsrealtime/v1.0/feed/vehicleposition"

export async function GET(request: Request) {
    const clientId = import.meta.env.VITE_WALTTI_CLIENT_ID;

    if (!clientId) {
        console.error("VITE_WALTTI_CLIENT_ID is not defined in the environment.");
        throw new Error("Environment variable VITE_WALTTI_CLIENT_ID is required.");
    }

        // Example API call using the client ID
        const response = await fetch(`${WALTTI_ENDPOINT}${VEHICLE_POS}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${clientId}`,
                'Content-Type': 'application/json',
            },
        });
    
        if (!response.ok) {
            console.error("Failed to fetch data:", response.statusText);
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
    
        const data = await response.json();
        return data;    
  }