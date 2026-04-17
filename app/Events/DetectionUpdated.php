<?php

namespace App\Events;

use App\Models\Garden;
use App\Models\Notification;
use App\Services\InfobipSmsService;
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
        public int $cropId,
        public string $cropName,
        public array $detectionData
    ) {
        $unhealthyResults = collect($this->detectionData['results'] ?? [])
            ->filter(fn($result) => strtolower($result['detected_class'] ?? '') !== 'healthy')
            ->values();

        if ($unhealthyResults->isNotEmpty()) {
            $user = Garden::find($this->gardenId)?->user;

            $issueList = $unhealthyResults->map(function ($r) {
                $label      = $r['detected_class'] ?? 'Unknown';
                $confidence = isset($r['confidence'])
                    ? round($r['confidence'] * 100) . '%'
                    : '';
                return $confidence ? "{$label} ({$confidence})" : $label;
            })->join(', ');

            Notification::create([
                'user_id' => $user->id,
                'type'    => 'plant_detection',
                'title'   => "Unhealthy Detection on {$this->cropName}",
                'message' => "Issues found: {$issueList}",
            ]);

            if ($user?->phone) {
                app(InfobipSmsService::class)->send(
                    $user->phone,
                    "🌿 SIBOL: {$this->cropName} has issues detected — {$issueList}. Check your dashboard!"
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
        return 'detection.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'detection' => [
                'crop_id' => $this->cropId,
                'crop_name' => $this->cropName,
                'results' => $this->detectionData['results'] ?? [],
                'image_url' => $this->detectionData['image_url'] ?? null,
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}
