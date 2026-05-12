<?php
namespace App\Http\Controllers;

use App\Models\Truck;
use Illuminate\Http\Request;

class TruckController extends Controller
{
    public function index()
    {
        return Truck::with('liveLocation')
            ->latest()
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plate_number' => 'required|string|unique:trucks',
            'model' => 'required|string',
            'capacity_tons' => 'required|numeric|min:0.1',
            'driver_name' => 'nullable|string|max:100',
        ]);

        $truck = Truck::create($data);
        return response()->json($truck, 201);
    }

    public function show(Truck $truck)
    {
        return $truck->load([
            'liveLocation',
            'shipments' => fn($q) => $q->latest()->limit(5),
        ]);
    }

    public function update(Request $request, Truck $truck)
    {
        $data = $request->validate([
            'status' => 'sometimes|in:idle,in_transit,maintenance',
            'driver_name' => 'sometimes|nullable|string',
            'fuel_level' => 'sometimes|numeric|between:0,100',
            'model' => 'sometimes|string',
        ]);

        $truck->update($data);
        return response()->json($truck);
    }

    public function destroy(Truck $truck)
    {
        $truck->delete();
        return response()->json(['message' => 'Truck removed from fleet']);
    }
}

