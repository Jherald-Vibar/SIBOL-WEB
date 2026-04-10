import { useEffect, useState } from 'react';
import echo from '../Views/echo';

export function useSensorData(gardenId) {
    const [sensorData, setSensorData] = useState(null);
    const [airHumidityHistory, setAirHumidityHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!gardenId) return;

        const channel = echo.channel(`garden.${gardenId}`);

        channel
            .subscribed(() => setIsConnected(true))
            .listen('.sensor.updated', (event) => {
                const data = event.sensor_data;

                setSensorData(data);

                setAirHumidityHistory(prev => {
                    const newEntry = {
                        time: new Date(data.recorded_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        temp: parseFloat(data.air_temperature?.toFixed(1)),
                        humidity: Math.round(data.air_humidity),
                    };
                    const updated = [...prev, newEntry];
                    return updated.slice(-10); // Keep consistency with historical data limit
                });
            });

        return () => {
            echo.leaveChannel(`garden.${gardenId}`);
            setIsConnected(false);
        };
    }, [gardenId]);

    useEffect(() => {
    if (!gardenId) {
        console.log('❌ gardenId is null, not subscribing');
        return;
    }

    console.log('✅ Subscribing to garden:', gardenId);

    const channel = echo.channel(`garden.${gardenId}`);

    channel
        .subscribed(() => {
            console.log('✅ Successfully subscribed to garden channel');
            setIsConnected(true);
        })
        .listen('.sensor.updated', (event) => {
            console.log('🌱 SENSOR DATA RECEIVED:', event);
            // ... rest of your code
        });

    return () => {
        echo.leaveChannel(`garden.${gardenId}`);
        setIsConnected(false);
    };
}, [gardenId]);

    // Added setAirHumidityHistory to the return object
    return { sensorData, airHumidityHistory, setAirHumidityHistory, isConnected };
}
