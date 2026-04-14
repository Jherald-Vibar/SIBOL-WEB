<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpMqtt\Client\Facades\MQTT;

class IrrigationController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate([
            'garden_id' => 'required',
            'state'     => 'required|in:on,off',
        ]);

        $topic   = "garden/{$request->garden_id}/irrigation";
        $payload = json_encode([
            'state'      => $request->state,
            'manual'     => true,
            'triggered_at' => now()->toISOString(),
        ]);

        MQTT::publish($topic, $payload);

        return response()->json([
            'success' => true,
            'message' => "Irrigation turned {$request->state}",
            'state'   => $request->state,
        ]);
    }
}
