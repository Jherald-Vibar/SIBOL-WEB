<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crops', function (Blueprint $table) {
            $table->foreignId('crop_profile_id')
                  ->nullable()
                  ->after('garden_id')
                  ->constrained('crop_profiles')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('crops', function (Blueprint $table) {
            $table->dropForeign(['crop_profile_id']);
            $table->dropColumn('crop_profile_id');
        });
    }
};
