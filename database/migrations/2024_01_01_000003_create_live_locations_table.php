<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('live_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('truck_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('speed_kmh', 6, 2)->default(0);
            $table->string('address')->nullable();
            $table->timestamp('last_updated')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_locations');
    }
};

