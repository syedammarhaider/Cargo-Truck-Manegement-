<?php
namespace App\Http\Controllers;

use App\Jobs\SendShipmentNotification;
use App\Models\Shipment;
use App\Models\Truck;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Shipment::with([
            'truck:id,plate_number,model',
            'customer:id,name,email',
        ])->latest();

        if ($user->role === 'customer') {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('tracking_number', 'like', '%' . $request->search . '%');
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'truck_id' => 'required|exists:trucks,id',
            'origin' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'weight_kg' => 'required|numeric|min:1',
            'volume_m3' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $truck = Truck::findOrFail($data['truck_id']);
        if ($truck->status !== 'idle') {
            return response()->json(['error' => 'This truck is not available'], 422);
        }

        $shipment = Shipment::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'estimated_delivery' => now()->addDays(3),
        ]));

        $truck->update(['status' => 'in_transit']);

        SendShipmentNotification::dispatch($shipment)->onQueue('notifications');

        return response()->json($shipment->load('truck'), 201);
    }

    public function show(Shipment $shipment)
    {
        return $shipment->load(['truck.liveLocation', 'customer:id,name,email']);
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $data = $request->validate([
            'status' => 'required|in:dispatched,in_transit,delivered,cancelled',
        ]);

        $shipment->update($data);

        if ($data['status'] === 'delivered' || $data['status'] === 'cancelled') {
            $shipment->truck->update(['status' => 'idle']);
        }

        return response()->json($shipment->load('truck'));
    }
}

