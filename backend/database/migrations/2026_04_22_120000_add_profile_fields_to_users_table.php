<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('role');
            $table->string('department')->nullable()->after('phone');
            $table->string('session')->nullable()->after('department');
            $table->text('address')->nullable()->after('session');
            $table->string('status')->default('active')->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'department',
                'session',
                'address',
                'status',
            ]);
        });
    }
};
