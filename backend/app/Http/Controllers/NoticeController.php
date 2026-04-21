<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index()
    {
        $notices = Notice::with('creator:id,name')
            ->latest()
            ->get()
            ->map(function (Notice $notice) {
                return [
                    'id' => $notice->id,
                    'content' => $notice->content,
                    'author' => $notice->creator?->name,
                    'created_at' => $notice->created_at,
                    'time_ago' => $notice->created_at?->diffForHumans(),
                ];
            });

        return response()->json([
            'notices' => $notices,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $notice = Notice::create([
            'created_by' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Notice published successfully',
            'notice' => [
                'id' => $notice->id,
                'content' => $notice->content,
                'author' => $request->user()->name,
                'created_at' => $notice->created_at,
                'time_ago' => $notice->created_at?->diffForHumans(),
            ],
        ], 201);
    }

    public function update(Request $request, Notice $notice)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $notice->update([
            'content' => $request->content,
        ]);

        $notice->load('creator:id,name');

        return response()->json([
            'message' => 'Notice updated successfully',
            'notice' => [
                'id' => $notice->id,
                'content' => $notice->content,
                'author' => $notice->creator?->name,
                'created_at' => $notice->created_at,
                'time_ago' => $notice->created_at?->diffForHumans(),
            ],
        ]);
    }

    public function destroy(Notice $notice)
    {
        $notice->delete();

        return response()->json([
            'message' => 'Notice deleted successfully',
        ]);
    }
}
