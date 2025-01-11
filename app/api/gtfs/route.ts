import { NextResponse } from 'next/server';
import path from 'path';
import protobuf from 'protobufjs';

const WALTTI_ENDPOINT = "https://data.waltti.fi";

export async function GET() {
    const clientId = process.env.WALTTI_CLIENT_ID || "";
    const clientSecret = process.env.WALTTI_CLIENT_SECRET || "";

    if (!clientId || !clientSecret) {
        return NextResponse.json(
        { error: "Client ID or Secret is missing from environment variables." },    
        { status: 500 }
        );
    }

    try {
    // Load proto file
    const root = await protobuf.load(path.join(process.cwd(), 'protos', 'gtfs-realtime.proto'));
    const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = `${WALTTI_ENDPOINT}/tampere/api/gtfsrealtime/v1.0/feed/tripupdate`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
      },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    // Decode protobuf message
    const message = FeedMessage.decode(new Uint8Array(buffer));
    
    // Convert to plain JavaScript object
    const object = FeedMessage.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });

    return NextResponse.json(object);
    
    // eslint-disable-next-line
  } catch (error: any) {
    console.error('Fetch error:', error);  // Add logging
    return NextResponse.json(
      { error: `Unexpected error occurred: ${error.message}` }, 
      { status: 500 }
    );
  }
}
