<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('esps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->foreignId('garden_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('serial_number')->unique();
            $table->enum('status', ['active','inactive'])->default('inactive');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('esps');
    }
};
