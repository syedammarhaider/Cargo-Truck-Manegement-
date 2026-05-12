<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['user', 'shipment']);
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        $invoices = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'data' => $invoices
        ]);
    }
    
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'invoice_number' => 'required|string|max:50|unique:invoices',
            'user_id' => 'required|exists:users,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'total' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'status' => 'required|in:paid,unpaid,overdue',
            'notes' => 'nullable|string|max:1000'
        ]);
        
        // Generate invoice number if not provided
        if (empty($data['invoice_number'])) {
            $data['invoice_number'] = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 4, '0', STR_PAD_LEFT);
        }
        
        $invoice = Invoice::create($data);
        
        return response()->json([
            'data' => $invoice->load(['user', 'shipment'])
        ], 201);
    }
    
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json([
            'data' => $invoice->load(['user', 'shipment'])
        ]);
    }
    
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'total' => 'sometimes|numeric|min:0',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:paid,unpaid,overdue',
            'notes' => 'nullable|string|max:1000'
        ]);
        
        $invoice->update($data);
        
        return response()->json([
            'data' => $invoice->load(['user', 'shipment'])
        ]);
    }
    
    public function download(Invoice $invoice): JsonResponse
    {
        // For now, return a simple response
        // In a real app, you'd generate a PDF here
        return response()->json([
            'message' => 'PDF download not implemented yet',
            'invoice' => $invoice->load(['user', 'shipment'])
        ]);
    }
    
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        
        return response()->json([
            'message' => 'Invoice deleted successfully'
        ]);
    }
}
