<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DetectionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $gardenId,
        public string $cropName,
        public array $detectionData
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("garden.{$this->gardenId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'detection.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'detection' => [
                'results' => $this->detectionData['results'] ?? [],
                'image_url' => $this->detectionData['image_url'] ?? null,
                'crop_name' => $this->cropName,
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}
