<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class IrrigationController extends Controller
{
    public function toggle(Request $request)
    {
        try {
            $gardenId = $request->input('garden_id');
            $state    = $request->input('state');

            if (!$gardenId || !in_array($state, ['on', 'off'])) {
                return response()->json([
                    'success' => false,
                    'error'   => 'garden_id and state (on/off) are required.',
                    'received' => $request->all(), // 👈 shows exactly what Laravel received
                ], 422);
            }

            $host     = env('MQTT_HOST');
            $port     = (int) env('MQTT_PORT', 8883);
            $username = env('MQTT_USERNAME');
            $password = env('MQTT_PASSWORD');
            $clientId = 'sibol-laravel-' . uniqid();
            $topic    = "garden/{$gardenId}/irrigation";
            $payload  = json_encode([
                'state'        => $state,
                'manual'       => true,
                'triggered_at' => now()->toISOString(),
            ]);

            $context = stream_context_create([
                'ssl' => [
                    'verify_peer'      => true,
                    'verify_peer_name' => true,
                ],
            ]);

            $socket = stream_socket_client(
                "ssl://{$host}:{$port}",
                $errno,
                $errstr,
                10,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                throw new \Exception("Socket connection failed: {$errstr} ({$errno})");
            }

            stream_set_timeout($socket, 10);

            $clientIdLen  = strlen($clientId);
            $usernameLen  = strlen($username);
            $passwordLen  = strlen($password);

            $connectPayload =
                "\x00\x04MQTT"          .
                "\x04"                  .
                "\xC2"                  .
                "\x00\x3C"             .
                chr(0) . chr($clientIdLen) . $clientId .
                chr(0) . chr($usernameLen) . $username .
                chr(0) . chr($passwordLen) . $password;

            $remainingLength = strlen($connectPayload);
            $connectPacket   = "\x10" . chr($remainingLength) . $connectPayload;

            fwrite($socket, $connectPacket);

            $connack = fread($socket, 4);
            if (!$connack || ord($connack[0]) !== 0x20) {
                throw new \Exception('MQTT CONNACK not received.');
            }
            $returnCode = ord($connack[3]);
            if ($returnCode !== 0) {
                $codes = [
                    1 => 'Unacceptable protocol version',
                    2 => 'Identifier rejected',
                    3 => 'Server unavailable',
                    4 => 'Bad username or password',
                    5 => 'Not authorized',
                ];
                throw new \Exception('MQTT connection refused: ' . ($codes[$returnCode] ?? "Code {$returnCode}"));
            }

            $topicLen       = strlen($topic);
            $publishPayload =
                chr(0) . chr($topicLen) . $topic .
                $payload;

            $remainingLength = strlen($publishPayload);
            $publishPacket   = "\x30" . chr($remainingLength) . $publishPayload;

            fwrite($socket, $publishPacket);
            usleep(200000);

            fwrite($socket, "\xe0\x00");
            fclose($socket);

            return response()->json([
                'success' => true,
                'message' => "Irrigation turned {$state}",
                'state'   => $state,
                'topic'   => $topic,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ], 500);
        }
    }
}
