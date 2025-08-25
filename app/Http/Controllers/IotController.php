<?php

namespace App\Http\Controllers;

use App\Models\EspData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IotController extends Controller
{
    public function getEspData(Request $request) {

        $validator = Validator::make($request->all(), [
            'mositure' => 'required',
            'humidity' => 'required',
            'espId' =>  'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $espData = EspData::where('esp_id', $validated['espId'])->first();

        if($espData) {
            $espData->update([
                'moisture' => $validated['moisture'],
                'humidity' => $validated['humidity'],
                'location' => $validated['location'] ?? null,
            ]);
        } else {
            $espData->create([
                'esp_id' => $validated['espId'],
                'moisture' => $validated['moisture'],
                'humidity' => $validated['humidity'],
                'location' => $validated['location'] ?? null,
            ]);
        }

        return response()->json([
            'status' => 'Success',
            'data' => $espData,
        ], 200);
    }

    public function fetchEspData() {
        $espData = EspData::all();

        return response()->json([
            'data' => $espData,
        ], 200);
    }


}
