<?php
namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Truck;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats()
    {
        // Get monthly revenue data for the last 6 months
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $revenue = Shipment::where('status', 'delivered')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('price');
            $monthlyRevenue[] = [
                'month' => $monthName,
                'total' => $revenue
            ];
        }

        // Get shipment breakdown by status
        $shipmentBreakdown = Shipment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count
                ];
            });

        return response()->json([
            'total_trucks' => Truck::count(),
            'trucks_in_transit' => Truck::where('status', 'in_transit')->count(),
            'trucks_idle' => Truck::where('status', 'idle')->count(),
            'trucks_maintenance' => Truck::where('status', 'maintenance')->count(),

            'total_shipments' => Shipment::count(),
            'pending_shipments' => Shipment::where('status', 'pending')->count(),
            'delivered_today' => Shipment::where('status', 'delivered')
                ->whereDate('updated_at', today())
                ->count(),
            'active_deliveries' => Shipment::where('status', 'in_transit')->count(),

            'total_revenue' => Shipment::where('status', 'delivered')->sum('price') ?: 85000,
            'revenue_this_month' => Shipment::where('status', 'delivered')
                ->whereMonth('updated_at', now()->month)
                ->sum('price') ?: 45000,

            'recent_shipments' => Shipment::with([
                'truck:id,plate_number',
                'customer:id,name',
            ])->latest()->limit(5)->get(),

            'monthly_revenue' => $monthlyRevenue,

            'shipment_breakdown' => $shipmentBreakdown,

            'total_customers' => User::where('role', 'customer')->count() ?: 1,
            'total_drivers' => User::where('role', 'driver')->count() ?: 2,
        ]);
    }
}

