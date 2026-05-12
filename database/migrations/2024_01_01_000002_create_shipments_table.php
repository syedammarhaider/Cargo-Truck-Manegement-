<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->foreignId('truck_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('origin');
            $table->string('destination');
            $table->decimal('weight_kg', 10, 2);
            $table->decimal('volume_m3', 8, 2)->nullable();
            $table->enum('status', ['pending', 'dispatched', 'in_transit', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('price', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};

