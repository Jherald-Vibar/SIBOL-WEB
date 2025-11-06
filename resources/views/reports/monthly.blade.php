<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Report - {{ $monthName }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a5568; padding-bottom: 10px; }
        .crop-section { page-break-after: always; margin-bottom: 40px; }
        .crop-header { background: #48bb78; color: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
        .summary { background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9px; }
        th, td { border: 1px solid #cbd5e0; padding: 6px; text-align: left; }
        th { background-color: #4a5568; color: white; }
        tr:nth-child(even) { background-color: #f7fafc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 Sibol Smart Garden</h1>
        <h2>Monthly Report: {{ $monthName }}</h2>
        <p>User: {{ $user->name }} | ESP Device: {{ $esp->serial_number }}</p>
    </div>

    @foreach($cropsData as $cropName => $cropData)
    <div class="crop-section">
        <div class="crop-header">
            <h2>🌱 {{ $cropName }}</h2>
        </div>

        <div class="summary">
            <h3> Monthly Summary</h3>
            <table>
                <tr>
                    <td><strong>Total Readings:</strong></td>
                    <td>{{ $cropData['summary']['total_readings'] }}</td>
                    <td><strong>Days with Data:</strong></td>
                    <td>{{ $cropData['summary']['days_with_data'] }}</td>
                </tr>
                <tr>
                    <td><strong>Avg Soil Temp:</strong></td>
                    <td>{{ $cropData['summary']['avg_soil_temp'] }}°C</td>
                    <td><strong>Avg Air Temp:</strong></td>
                    <td>{{ $cropData['summary']['avg_air_temp'] }}°C</td>
                </tr>
                <tr>
                    <td><strong>Avg Humidity:</strong></td>
                    <td>{{ $cropData['summary']['avg_humidity'] }}%</td>
                    <td><strong>Avg Moisture:</strong></td>
                    <td>{{ $cropData['summary']['avg_moisture'] }}</td>
                </tr>
                <tr>
                    <td><strong>Avg pH:</strong></td>
                    <td>{{ $cropData['summary']['avg_ph'] }}</td>
                    <td><strong>Avg EC:</strong></td>
                    <td>{{ $cropData['summary']['avg_ec'] }} mS/cm</td>
                </tr>
                <tr>
                    <td><strong>N-P-K Avg:</strong></td>
                    <td colspan="3">
                        N: {{ $cropData['summary']['avg_n'] }} |
                        P: {{ $cropData['summary']['avg_p'] }} |
                        K: {{ $cropData['summary']['avg_k'] }} mg/kg
                    </td>
                </tr>
            </table>
        </div>

        <h3>Daily Data</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Soil T</th>
                    <th>Air T</th>
                    <th>Hum</th>
                    <th>Moist</th>
                    <th>pH</th>
                    <th>EC</th>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Reads</th>
                </tr>
            </thead>
            <tbody>
                @foreach($cropData['daily_data'] as $day)
                <tr>
                    <td>{{ $day['date'] }}</td>
                    <td>{{ $day['avg_soil_temp'] }}</td>
                    <td>{{ $day['avg_air_temp'] }}</td>
                    <td>{{ $day['avg_humidity'] }}</td>
                    <td>{{ $day['avg_moisture'] }}</td>
                    <td>{{ $day['avg_ph'] }}</td>
                    <td>{{ $day['avg_ec'] }}</td>
                    <td>{{ $day['avg_n'] }}</td>
                    <td>{{ $day['avg_p'] }}</td>
                    <td>{{ $day['avg_k'] }}</td>
                    <td>{{ $day['readings_count'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endforeach

    <div style="text-align: center; font-size: 10px; color: #718096;">
        <p>Generated on {{ date('F d, Y h:i A') }}</p>
    </div>
</body>
</html>
