<?php

namespace App\Http\Controllers;

use App\Models\Garden;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GardenController extends Controller
{
    public function addGarden(Request $request) {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'garden_name' => 'required|unique:gardens,name',
            'location' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->errors(),
                'status' => 'Failed',
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $garden = Garden::create([
                'user_id' => $user->id,
                'name' => $validated['garden_name'],
                'location' => $validated['location'],
            ]);

            return response()->json([
                "message" => "Garden Successfully Created!",
                "status" => "Success!",
                "garden" => $garden,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                "message" => $e->getMessage(),
                "status" => "Failed"
            ], 500);
        }
    }

    public function getLocation(Request $request) {
        $user = $request->user();

        $locations = $user->gardens()->pluck('location');

        return response()->json([
        'locations' => $locations
        ], 200);
    }

    public function getGardenData(Request $request) {
        $user = $request->user();

        $gardenData = $user->gardens()->get();

        return response()->json($gardenData);
    }
}
