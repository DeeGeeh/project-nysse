import { NextResponse } from 'next/server';

const DIGITRANSIT_ENDPOINT = 'https://api.digitransit.fi/routing/v2/waltti/gtfs/v1';

export async function GET() {
    const subscriptionKey = process.env.DIGITRANSIT_KEY || "";

    if (!subscriptionKey) {
        return NextResponse.json(
            { error: "Digitrasnsit key missing." },
            { status: 500 }
        );
    }

    try {
        const delayedTrips = await fetchDelayedVehicles(subscriptionKey);
        return NextResponse.json(delayedTrips, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching delayed vehicles:", error);
        return NextResponse.json(
            { error: "Failed to fetch delayed vehicles." },
            { status: 500 }
        );
    }
}

async function fetchDelayedVehicles(subscriptionKey: string) {

    const query = `
    {
      trips(feeds: "tampere") {
        id
        routeShortName
        tripHeadsign
        stoptimesForDate(serviceDate: "20250111") {
          departureDelay
          realtimeState
        }
      }
    }`;

    try {
        const response = await fetch(DIGITRANSIT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/graphql',
                'digitransit-subscription-key': subscriptionKey,
            },
            body: query,
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        const data = await response.json();

        // Get delayed trips
        let delayedTrips = data.data.trips.filter((trip: any) =>
            trip.stoptimesForDate.some((stop: any) => stop.departureDelay > 60)
        );
        delayedTrips = data.data.trips.filter((trip: any) => 
            trip.stoptimesForDate.some((stop: any) => stop.realtimeState != "CANCELED")
        );

        return delayedTrips;

    } catch (error: any) {
        console.error('Fetch error:', error);  // Add logging
        return NextResponse.json(
            { error: `Unexpected error occurred: ${error.message}` }, 
            { status: 500 }
            
        );
    }
}
