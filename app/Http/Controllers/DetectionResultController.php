<?php

namespace App\Http\Controllers;


use App\Models\DetectionResults;
use App\Models\Esp;
use App\Models\SensorData;
use Illuminate\Http\Request;

class DetectionResultController extends Controller
{

    public function getBySensorData($sensorDataId)
    {
        $sensorData = SensorData::with(['crop', 'esp'])->find($sensorDataId);

        if (!$sensorData) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sensor data not found'
            ], 404);
        }

        $detections = DetectionResults::where('sensor_data_id', $sensorDataId)
            ->get()
            ->map(function ($detection) {
                return [
                    'id' => $detection->id,
                    'detected_class' => $detection->detected_class,
                    'condition' => $detection->getConditionLabel(),
                    'confidence' => $detection->confidence,
                    'image_url' => $detection->image_url,
                    'recommendations' => $detection->recommendations,
                    'harvest_tips' => $detection->harvest_tips,
                ];
            });

        // Calculate summary
        $healthyCount = $detections->filter(fn($d) => str_contains(strtolower($d['detected_class']), 'healthy'))->count();
        $diseasedCount = $detections->count() - $healthyCount;

        $summary = [
            'total_plants_detected' => $detections->count(),
            'healthy_count' => $healthyCount,
            'diseased_count' => $diseasedCount,
            'average_confidence' => round($detections->avg('confidence'), 4),
        ];

        return response()->json([
            'status' => 'success',
            'sensor_data' => [
                'id' => $sensorData->id,
                'crop' => $sensorData->crop->name,
                'esp_id' => $sensorData->esp_id,
                'air_temperature' => $sensorData->air_temperature,
                'soil_moisture' => $sensorData->soil_moisture,
                'captured_at' => $sensorData->created_at,
            ],
            'summary' => $summary,
            'detections' => $detections,
        ]);
    }

    /**
     * Get latest scan with all its detections for a crop
     */
    public function getLatestScanByCrop($cropId)
    {
        // Get the most recent sensor data that has detections
        $latestSensorData = SensorData::where('crop_id', $cropId)
            ->whereHas('DetectionResultss')
            ->with(['DetectionResultss'])
            ->latest()
            ->first();

        if (!$latestSensorData) {
            return response()->json([
                'status' => 'error',
                'message' => 'No scans found for this crop'
            ], 404);
        }

        return $this->getBySensorData($latestSensorData->id);
    }

    /**
     * Get latest scan for an ESP device
     */
    public function getLatestScanByEsp($espId)
    {
        $latestSensorData = SensorData::where('esp_id', $espId)
            ->whereHas('DetectionResultss')
            ->with(['DetectionResultss', 'crop'])
            ->latest()
            ->first();

        if (!$latestSensorData) {
            return response()->json([
                'status' => 'error',
                'message' => 'No scans found for this ESP device'
            ], 404);
        }

        return $this->getBySensorData($latestSensorData->id);
    }

    /**
     * Get scan history for a crop (list of all scans)
     */
    public function getScanHistoryByCrop(Request $request, $cropId)
    {
        $limit = $request->query('limit', 10);

        $scans = SensorData::where('crop_id', $cropId)
            ->whereHas('DetectionResultss')
            ->with(['DetectionResultss'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($sensorData) {
                $detections = $sensorData->DetectionResultss;
                $healthyCount = $detections->filter(fn($d) => $d->isHealthy())->count();
                $diseasedCount = $detections->count() - $healthyCount;

                return [
                    'sensor_data_id' => $sensorData->id,
                    'scanned_at' => $sensorData->created_at,
                    'total_plants' => $detections->count(),
                    'healthy' => $healthyCount,
                    'diseased' => $diseasedCount,
                    'image_url' => $detections->first()->image_url ?? null,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $scans,
            'count' => $scans->count()
        ]);
    }

    /**
     * Get crop health overview (across all scans)
     */
    public function getCropHealthOverview($cropId)
    {
        $allDetections = DetectionResults::where('crop_id', $cropId)->get();

        if ($allDetections->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No detection history for this crop'
            ], 404);
        }

        $totalScans = SensorData::where('crop_id', $cropId)
            ->whereHas('DetectionResultss')
            ->count();

        $healthyCount = $allDetections->filter(fn($d) => $d->isHealthy())->count();
        $leafSpotCount = $allDetections->filter(fn($d) => $d->isLeafSpot())->count();
        $yellowLeafCount = $allDetections->filter(fn($d) => $d->isYellowLeaf())->count();

        // Get current week issues
        $recentIssues = DetectionResults::where('crop_id', $cropId)
            ->where('created_at', '>=', now()->subDays(7))
            ->get()
            ->filter(fn($d) => !$d->isHealthy())
            ->groupBy('detected_class')
            ->map(fn($group) => $group->count())
            ->toArray();

        $overview = [
            'total_scans' => $totalScans,
            'total_plants_detected' => $allDetections->count(),
            'health_distribution' => [
                'healthy' => $healthyCount,
                'leaf_spot' => $leafSpotCount,
                'yellow_leaf' => $yellowLeafCount,
            ],
            'health_percentage' => [
                'healthy' => $allDetections->count() > 0 ? round(($healthyCount / $allDetections->count()) * 100, 2) : 0,
                'diseased' => $allDetections->count() > 0 ? round((($leafSpotCount + $yellowLeafCount) / $allDetections->count()) * 100, 2) : 0,
            ],
            'average_confidence' => round($allDetections->avg('confidence'), 4),
            'last_scan' => SensorData::where('crop_id', $cropId)
                ->whereHas('DetectionResultss')
                ->latest()
                ->first()
                ->created_at ?? null,
            'current_week_issues' => $recentIssues,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $overview
        ]);
    }

    /**
     * Get all currently diseased plants (recent scans only)
     */
    public function getCurrentDiseased(Request $request)
    {
        $daysBack = $request->query('days', 7); // Default: last 7 days

        $diseased = DetectionResults::where('created_at', '>=', now()->subDays($daysBack))
            ->where(function ($query) {
                $query->where('detected_class', 'LIKE', '%leaf_spot%')
                      ->orWhere('detected_class', 'LIKE', '%yellow_leaf%');
            })
            ->with(['crop', 'sensorData'])
            ->latest()
            ->get()
            ->map(function ($detection) {
                return [
                    'id' => $detection->id,
                    'crop' => $detection->crop->name,
                    'detected_class' => $detection->detected_class,
                    'condition' => $detection->getConditionLabel(),
                    'confidence' => $detection->confidence,
                    'recommendations' => $detection->recommendations,
                    'image_url' => $detection->image_url,
                    'detected_at' => $detection->created_at,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $diseased,
            'count' => $diseased->count(),
            'period_days' => $daysBack
        ]);
    }

    /**
     * Get statistics dashboard
     */
    public function getStatistics()
    {
        $totalDetections = DetectionResults::count();
        $totalScans = SensorData::whereHas('DetectionResultss')->count();

        $stats = [
            'total_scans' => $totalScans,
            'total_plants_detected' => $totalDetections,
            'average_plants_per_scan' => $totalScans > 0 ? round($totalDetections / $totalScans, 2) : 0,
            'overall_health' => [
                'healthy' => DetectionResults::where('detected_class', 'LIKE', '%healthy%')->count(),
                'leaf_spot' => DetectionResults::where('detected_class', 'LIKE', '%leaf_spot%')->count(),
                'yellow_leaf' => DetectionResults::where('detected_class', 'LIKE', '%yellow_leaf%')->count(),
            ],
            'by_crop' => DetectionResults::selectRaw('crop_id, crops.name as crop_name, count(*) as total_detections')
                ->join('crops', 'crops.id', '=', 'detection_results.crop_id')
                ->groupBy('crop_id', 'crops.name')
                ->get(),
            'recent_scans' => SensorData::whereHas('DetectionResultss')
                ->with(['crop', 'DetectionResultss'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($scan) {
                    return [
                        'id' => $scan->id,
                        'crop' => $scan->crop->name,
                        'plants_detected' => $scan->DetectionResultss->count(),
                        'scanned_at' => $scan->created_at,
                    ];
                }),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Get specific detection by ID
     */
    public function getById($id)
    {
        $detection = DetectionResults::with(['crop', 'esp', 'sensorData'])
            ->find($id);

        if (!$detection) {
            return response()->json([
                'status' => 'error',
                'message' => 'Detection not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $detection->id,
                'crop' => $detection->crop->name,
                'detected_class' => $detection->detected_class,
                'condition' => $detection->getConditionLabel(),
                'confidence' => $detection->confidence,
                'image_url' => $detection->image_url,
                'recommendations' => $detection->recommendations,
                'harvest_tips' => $detection->harvest_tips,
                'sensor_data' => $detection->sensorData,
                'detected_at' => $detection->created_at,
            ]
        ]);
    }

    public function getCropAdvisory(Request $request) {
        $user = $request->user();
        $espIds = Esp::where('user_id', $user->id)->pluck('id');
        $cropAdvisory = DetectionResults::with('crop')
            ->whereIn('esp_id', $espIds)
            ->get();

        return response()->json([
            "message" => "success",
            'data' => $cropAdvisory,
        ], 200);
    }
}
