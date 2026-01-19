export interface Coordinates {
    latitude: number;
    longitude: number;
}

export async function getCoordinatesFromAddress(
    street: string,
    number: string,
    city: string,
    region: string,
    country: string
): Promise<Coordinates | null> {
    try {
        const query = `${street} ${number}, ${city}, ${region}, ${country}`;
        const encodedQuery = encodeURIComponent(query);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'UrbanVibeApp/1.0'
            }
        });

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
}
