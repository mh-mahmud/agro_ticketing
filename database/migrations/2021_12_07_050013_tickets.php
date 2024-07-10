<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Tickets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('subject')->index();
            $table->string('contact_id')->comment('Ticket generate for which user (User id)');// Foreign key
            $table->string('account_no', 50)->nullable()->comment('Bank acc no.');
            $table->string('card_no', 50)->nullable()->comment('Bank acc card no.');
            $table->string('cif_id', 50)->nullable();
            $table->unsignedBigInteger('type_id')->nullable();// Foreign key
            $table->unsignedBigInteger('status_id');// Foreign key
            $table->unsignedBigInteger('priority_id');// Foreign key
            $table->unsignedBigInteger('group_id')->nullable()->default(0);// Foreign key
            $table->unsignedBigInteger('source_id')->nullable()->default(0);// Foreign key
            $table->unsignedBigInteger('tag_id')->nullable()->default(0);// Foreign key
            // $table->string('agent_id')->nullable()->comment('User id whose role is agent');// Foreign key
            $table->longText('description')->nullable();
            $table->unsignedBigInteger('created_by')->comment('User ID');// Foreign key, User ID
            $table->char('crm_user_id', 6)->nullable();
            $table->string('crm_user_name', 80)->nullable();
            $table->string('approved_by')->comment('User ID, 0 = (Zero) No need to approve, null need approval')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tickets');
    }
}
