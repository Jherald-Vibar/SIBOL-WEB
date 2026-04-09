<?php

namespace App\Events;

use App\Models\SensorData;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SensorData $sensorData,
        public int $gardenId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("garden.{$this->gardenId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'sensor.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'sensor_data' => [
                'soil_temperature'        => $this->sensorData->soil_temperature,
                'air_temperature'         => $this->sensorData->air_temperature,
                'air_humidity'            => $this->sensorData->air_humidity,
                'soil_moisture'           => $this->sensorData->soil_moisture,
                'ph'                      => $this->sensorData->ph,
                'electrical_conductivity' => $this->sensorData->electrical_conductivity,
                'nitrogen'                => $this->sensorData->nitrogen,
                'phosphorus'              => $this->sensorData->phosphorus,
                'potassium'               => $this->sensorData->potassium,
                'recorded_at'             => $this->sensorData->created_at->toISOString(),
            ],
        ];
    }
}
