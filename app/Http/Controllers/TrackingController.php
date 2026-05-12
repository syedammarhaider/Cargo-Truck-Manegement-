<?php
namespace App\Http\Controllers;

use App\Events\TruckLocationUpdated;
use App\Models\LiveLocation;
use App\Models\TrackingLog;
use App\Models\Truck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackingController extends Controller
{
    private function authorizeTracking(Request $request): void
    {
        // Simple safety gate: only authenticated users can hit tracking endpoints.
        // Additional role-based authorization can be added later.
        if (! $request->user()) {
            abort(401);
        }
    }

    /**
     * Update truck GPS position
     */
    public function update(Request $request)
    {
        $this->authorizeTracking($request);

        $data = $request->validate([

            'truck_id' => 'required|exists:trucks,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed_kmh' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|between:0,360',
            'address' => 'nullable|string|max:500',
        ]);

        $truck = Truck::with('activeDelivery.route')->find($data['truck_id']);

        // Calculate distance traveled and ETA if there's an active delivery
        $distanceTraveled = null;
        $distanceRemaining = null;
        $eta = null;

        if ($truck->activeDelivery && $truck->activeDelivery->route) {
            $route = $truck->activeDelivery->route;
            
            // Calculate distance from origin
            $distanceTraveled = $this->calculateDistance(
                $route->origin_lat,
                $route->origin_lng,
                $data['latitude'],
                $data['longitude']
            );

            // Calculate distance to destination
            $distanceRemaining = $this->calculateDistance(
                $data['latitude'],
                $data['longitude'],
                $route->destination_lat,
                $route->destination_lng
            );

            // Estimate ETA based on current speed and distance
            if ($data['speed_kmh'] > 0) {
                $hoursRemaining = $distanceRemaining / $data['speed_kmh'];
                $eta = now()->addHours($hoursRemaining);
            }
        }

        $location = LiveLocation::updateOrCreate(
            ['truck_id' => $data['truck_id']],
            [
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'speed_kmh' => $data['speed_kmh'] ?? 0,
                'heading' => $data['heading'] ?? null,
                'address' => $data['address'] ?? null,
                'distance_traveled_km' => $distanceTraveled,
                'distance_remaining_km' => $distanceRemaining,
                'estimated_arrival' => $eta,
                'last_updated' => now(),
            ]
        );

        // Log position history
        TrackingLog::create([
            'truck_id' => $data['truck_id'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'speed_kmh' => $data['speed_kmh'] ?? 0,
            'heading' => $data['heading'] ?? null,
            'logged_at' => now(),
        ]);

        // Broadcast real-time update
        broadcast(new TruckLocationUpdated([
            'truck_id' => $location->truck_id,
            'lat' => $location->latitude,
            'lng' => $location->longitude,
            'speed' => $location->speed_kmh,
            'heading' => $location->heading,
            'address' => $location->address,
            'distance_traveled' => $distanceTraveled,
            'distance_remaining' => $distanceRemaining,
            'eta' => $eta?->toIso8601String(),
            'updated_at' => $location->last_updated->toIso8601String(),
        ]))->toOthers();

        return response()->json([
            'status' => 'success',
            'location' => $location,
            'metrics' => [
                'distance_traveled_km' => $distanceTraveled,
                'distance_remaining_km' => $distanceRemaining,
                'eta' => $eta?->toIso8601String(),
            ]
        ]);
    }

    /**
     * Get all active truck positions with route details
     */
    public function allPositions()
    {
        $positions = LiveLocation::with([
            'truck' => function ($query) {
                $query->with([
                    'activeDelivery.route:id,delivery_id,origin_lat,origin_lng,origin_address,destination_lat,destination_lng,destination_address,total_distance_km',
                    'driver:id,name,phone,avatar_url'
                ])->select('id', 'plate_number', 'model', 'status', 'driver_id', 'fuel_level', 'vehicle_type');
            }
        ])->get();

        return response()->json($positions->map(function ($pos) {
            $truck = $pos->truck;
            $activeDelivery = $truck?->activeDelivery;
            $route = $activeDelivery?->route;

            return [
                'truck_id' => $pos->truck_id,
                'latitude' => $pos->latitude,
                'longitude' => $pos->longitude,
                'speed_kmh' => $pos->speed_kmh,
                'heading' => $pos->heading,
                'address' => $pos->address,
                'last_updated' => $pos->last_updated,
                'distance_traveled_km' => $pos->distance_traveled_km,
                'distance_remaining_km' => $pos->distance_remaining_km,
                'estimated_arrival' => $pos->estimated_arrival,
                
                'truck' => [
                    'id' => $truck?->id,
                    'plate_number' => $truck?->plate_number,
                    'model' => $truck?->model,
                    'status' => $truck?->status,
                    'fuel_level' => $truck?->fuel_level,
                    'vehicle_type' => $truck?->vehicle_type,
                    'driver' => $truck?->driver ? [
                        'name' => $truck->driver->name,
                        'phone' => $truck->driver->phone,
                        'avatar_url' => $truck->driver->avatar_url,
                    ] : null,
                ],

                'route' => $route ? [
                    'origin' => [
                        'lat' => $route->origin_lat,
                        'lng' => $route->origin_lng,
                        'address' => $route->origin_address,
                    ],
                    'destination' => [
                        'lat' => $route->destination_lat,
                        'lng' => $route->destination_lng,
                        'address' => $route->destination_address,
                    ],
                    'total_distance_km' => $route->total_distance_km,
                    'progress_percentage' => $pos->distance_traveled_km && $route->total_distance_km
                        ? min(100, ($pos->distance_traveled_km / $route->total_distance_km) * 100)
                        : 0,
                ] : null,
            ];
        }));
    }

    /**
     * Get position history for a specific truck
     */
    public function history(int $truckId)
    {
        $logs = TrackingLog::where('truck_id', $truckId)
            ->latest('logged_at')
            ->limit(200)
            ->get(['latitude', 'longitude', 'speed_kmh', 'heading', 'logged_at']);

        return response()->json($logs);
    }

    /**
     * Get fleet overview statistics
     */
    public function statistics()
    {
        $stats = [
            'total_trucks' => Truck::count(),
            'active_trucks' => Truck::where('status', 'in_transit')->count(),
            'idle_trucks' => Truck::where('status', 'idle')->count(),
            'maintenance_trucks' => Truck::where('status', 'maintenance')->count(),
            'average_speed' => LiveLocation::whereHas('truck', function ($q) {
                $q->where('status', 'in_transit');
            })->avg('speed_kmh'),
            'total_distance_today' => TrackingLog::whereDate('logged_at', today())
                ->select(DB::raw('SUM(
                    6371 * acos(
                        cos(radians(latitude)) * 
                        cos(radians(LAG(latitude) OVER (PARTITION BY truck_id ORDER BY logged_at))) * 
                        cos(radians(LAG(longitude) OVER (PARTITION BY truck_id ORDER BY logged_at)) - radians(longitude)) + 
                        sin(radians(latitude)) * 
                        sin(radians(LAG(latitude) OVER (PARTITION BY truck_id ORDER BY logged_at)))
                    )
                ) as total_distance'))
                ->value('total_distance'),
        ];

        return response()->json($stats);
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}