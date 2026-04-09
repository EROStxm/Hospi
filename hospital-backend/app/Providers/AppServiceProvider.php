<?php

namespace App\Providers;

use App\Models\Solicitud;
use App\Policies\SolicitudPolicy;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
    protected $policies = [
        Solicitud::class => SolicitudPolicy::class,
    ];
}
