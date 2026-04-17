<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InfobipSmsService
{
    public function send(string $to, string $message): void
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'App ' . config('services.infobip.api_key'),
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ])->post(config('services.infobip.base_url') . '/sms/2/text/advanced', [
                'messages' => [
                    [
                        'from'         => config('services.infobip.sender'),
                        'destinations' => [['to' => $to]],
                        'text'         => $message,
                    ]
                ]
            ]);

            Log::info('Infobip SMS sent', [
                'to'       => $to,
                'status'   => $response->status(),
                'response' => $response->json(),
            ]);

        } catch (\Exception $e) {
            Log::error('Infobip SMS failed', ['error' => $e->getMessage()]);
        }
    }
}
