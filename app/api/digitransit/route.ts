"use server";

import { NextResponse } from 'next/server';

const DIGITRANSIT_ENDPOINT = 'https://api.digitransit.fi/routing/v2/waltti/gtfs/v1';
const CACHE_DURATION = 90 * 1000;

let cacheData: any = null;
let cacheTimestamp: number = 0;

interface StopTime {
    realtimeArrival: number;
    scheduledDeparture: number;
    departureDelay: number;
    realtimeState: string;
    stop: {
        name: string;
    };
}

interface Trip {
    id: string;
    routeShortName: string;
    tripHeadsign: string;
    stoptimesForDate: StopTime[];
}

export async function GET() {
    const subscriptionKey = process.env.DIGITRANSIT_KEY || "";

    if (!subscriptionKey) {
        return NextResponse.json(
            { error: "Digitrasnsit key missing." },
            { status: 500 }
        );
    }

    // Check if cached data is still valid
    const now = Date.now();
    if (cacheData && now - cacheTimestamp < CACHE_DURATION) {
        return NextResponse.json(cacheData, { status: 200 });
    }

    try {
        const delayedTrips = await fetchDelayedVehicles(subscriptionKey);
        // Update cache
        cacheData = delayedTrips;
        cacheTimestamp = now;

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
    // Get current date in YYYYMMDD format
    const today: string = new Date().toISOString().split('T')[0].replace(/-/g, '');

    const query: string = `
    {
        trips(feeds: "tampere") {
            id
            routeShortName
            tripHeadsign
            stoptimesForDate(serviceDate: "${today}") {
                realtimeArrival
                scheduledDeparture
                departureDelay
                realtimeState
                stop {
                    name
                }
            }
        }
    }`;

    try {
        const response: Response = await fetch(DIGITRANSIT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'digitransit-subscription-key': subscriptionKey,
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok && cacheData === null) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        if (!response.ok) {
            return cacheData;
        }

        const data = await response.json();

        // Get the start of the current service day (midnight)
        const serviceDateStart: Date = new Date();
        serviceDateStart.setHours(0, 0, 0, 0);

        // Get the current time in seconds since midnight
        const now = Math.floor((Date.now() - new Date().setHours(0, 0, 0, 0)) / 1000);

        // Filter for active trips
        const activeTrips = data.data.trips.filter((trip: any) =>
            trip.stoptimesForDate.some(
                (stop: any) => stop.realtimeState === "UPDATED" && stop.realtimeArrival > now
            )
        );

        const activeTripCount: number = Object.keys(activeTrips).length; 

        // Process delayed trips
        const delayedTrips = await data.data.trips
            .filter((trip: any) => {
                // Check if trip has any stops with delays > 120 seconds AND not cancelled
                return trip.stoptimesForDate.some((stop: any) => 
                    stop.departureDelay > 300 && 
                    stop.realtimeState !== "CANCELED"
                );
            })
            .map((trip: any) => ({
                id: trip.id,
                routeShortName: trip.routeShortName,
                tripHeadsign: trip.tripHeadsign,
                delays: trip.stoptimesForDate
                    .filter((stop: any) => stop.departureDelay > 60)
                    .map((stop: any) => ({
                        stopName: stop.stop.name,
                        delayMinutes: Math.floor(stop.departureDelay / 60),
                        scheduledDeparture: new Date(
                            serviceDateStart.getTime() + (stop.scheduledDeparture * 1000)
                        ).toISOString(),
                        status: stop.realtimeState
                    }))
            }));

        return {
            totalTrips: activeTripCount,
            delayedTrips: delayedTrips,
            delayedCount: delayedTrips.length
        };

    } catch (error: any) {
        console.error('Fetch error:', error);
        throw error;
    }
}
