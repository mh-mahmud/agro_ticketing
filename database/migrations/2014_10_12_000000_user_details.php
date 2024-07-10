<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UserDetails extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('account_no', 50)->nullable()->comment('Bank acc no.');
            $table->string('card_no', 50)->nullable()->comment('Bank acc card no.');
            $table->string('cif_id', 50)->nullable();
            $table->string('slug');
            // $table->string('username')->unique()->index();
            $table->string('email')->unique();
            $table->string('mobile')->unique();
            $table->text('address')->nullable();
            // $table->timestamp('email_verified_at')->nullable();
            // $table->string('password');
            // $table->rememberToken();
            // $table->tinyInteger('status')->comment('0 => Inactive, 1 => Active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_details');
    }
}
