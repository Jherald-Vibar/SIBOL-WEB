<?php

  namespace App\Events;

use App\Models\Notification;
use App\Models\SensorData;
use App\Services\InfobipSmsService;
use App\Services\TwilioSmsService;
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
      ) {
          if ((float) $this->sensorData->soil_moisture < 5) {
              $user = $this->sensorData->crop?->garden?->user;

              if (!$user) return;

              Notification::create([
                  'user_id' => $user->id,
                  'type'    => 'soil_moisture',
                  'title'   => 'Low Soil Moisture',
                  'description' => "Soil moisture is at {$this->sensorData->soil_moisture}%. Irrigation needed immediately.",
              ]);

              if ($user->cp_number) {
                  app(TwilioSmsService::class)->send(
                      $user->cp_number,
                      "🚨 SIBOL Alert: Soil moisture is critically low at {$this->sensorData->soil_moisture}% in your garden. Irrigation needed now!"
                  );
              }
          }
      }

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
