<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MasterData;
use App\Models\User;
use App\Models\Production;
use App\Models\Stock;
use App\Models\Delivery;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {

        $MASTER_DATA = MasterData::count();
        $USERS = User::count();
        $PRODUCTION = Production::count();
        $STOCK = Stock::count();
        $DELIVERY = Delivery::count();
        $CATEGORY_PRODUCTION = Category::where('type', '=', 'production')->count();
        $CATEGORY_STOCK = Category::where('type', '=', 'stock')->count();
        $TAGS_PRODUCTION = Tag::whereHas('category', function ($query) {
            $query->where('type', 'production');
        })->count();
        $TAGS_STOCK = Tag::whereHas('category', function ($query) {
            $query->where('type', 'stock');
        })->count();
        $LOGGING = DB::table('logs')
            ->join('users', 'logs.user_id', '=', 'users.id')
            ->select([
                'users.id as user_id',
                'users.name as user_name',
                'logs.action as log_action',
                'logs.category as log_category',
                'logs.sku as log_sku',
                'logs.keterangan as log_keterangan',
                'logs.created_at as log_createdAt',
            ])
            ->orderBy('logs.created_at', 'desc')
            ->get();
        return Inertia::render('Dashboard', [
            'appName' => env('APP_NAME', 'DEFAULT'),
            'appTitle' => 'Dashboard',
            'nameUser' => $request->user()->name,
            'roleUser' => $request->user()->role,
            'total' => [
                'master_data' => $MASTER_DATA,
                'users' => $USERS - 1,
                'production' => $PRODUCTION,
                'stock' => $STOCK,
                'delivery' => $DELIVERY,
                'categoryProduction' => $CATEGORY_PRODUCTION,
                'categoryStock' => $CATEGORY_STOCK,
                'tagsProduction' => $TAGS_PRODUCTION,
                'tagsStock' => $TAGS_STOCK,
            ],
            'loggingData' => $LOGGING,
        ]);
    }
}
