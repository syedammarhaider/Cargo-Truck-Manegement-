<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tracking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('truck_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipment_id')->nullable()->constrained()->cascadeOnDelete();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('speed_kmh', 6, 2)->default(0);
            $table->timestamp('logged_at')->useCurrent();
            $table->index(['truck_id', 'logged_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_logs');
    }
};

