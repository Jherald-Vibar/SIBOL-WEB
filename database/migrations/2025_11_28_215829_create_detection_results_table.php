<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
          Schema::create('detection_results', function (Blueprint $table) {
          $table->id();
          $table->foreignId('sensor_data_id')->constrained('sensor_data')->onDelete('cascade');
          $table->foreignId('crop_id')->constrained()->onDelete('cascade');
          $table->foreignId('esp_id')->constrained()->onDelete('cascade');

          // Detection Information
          $table->string('detected_class');
          $table->decimal('confidence', 5, 4);
          $table->string('image_url')->nullable();

          // Recommendations
          $table->json('recommendations');
          $table->json('harvest_tips')->nullable();

          $table->timestamps();

          $table->index(['crop_id', 'created_at']);
          $table->index(['esp_id', 'created_at']);
          $table->index(['sensor_data_id', 'created_at']);
          $table->index('detected_class');
      });
    }

    public function down()
    {
        Schema::dropIfExists('detection_results');
    }
};
