<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\Notice;
use App\Models\Result;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function teacherSummary()
    {
        $totalStudents = User::where('role', 'student')->count();
        $studentsWithResults = Result::query()
            ->distinct()
            ->count('student_id');
        $pendingResults = max($totalStudents - $studentsWithResults, 0);
        $noticesCount = Notice::count();

        $recentStudents = User::query()
            ->where('role', 'student')
            ->latest()
            ->take(3)
            ->get()
            ->map(function (User $student) {
                return [
                    'id' => 'student-' . $student->id,
                    'message' => "Student registered: {$student->name}",
                    'created_at' => $student->created_at,
                ];
            });

        $recentResults = Result::query()
            ->with('student:id,name')
            ->latest()
            ->take(3)
            ->get()
            ->map(function (Result $result) {
                $studentName = $result->student?->name ?? 'Unknown student';

                return [
                    'id' => 'result-' . $result->id,
                    'message' => "Result added for {$studentName} ({$result->subject})",
                    'created_at' => $result->created_at,
                ];
            });

        $recentNotices = Notice::query()
            ->latest()
            ->take(3)
            ->get()
            ->map(function (Notice $notice) {
                return [
                    'id' => 'notice-' . $notice->id,
                    'message' => 'Notice published',
                    'created_at' => $notice->created_at,
                ];
            });

        $recentActivity = $recentStudents
            ->concat($recentResults)
            ->concat($recentNotices)
            ->sortByDesc('created_at')
            ->take(6)
            ->values()
            ->map(function (array $activity) {
                return [
                    'id' => $activity['id'],
                    'message' => $activity['message'],
                    'time_ago' => $activity['created_at']?->diffForHumans(),
                ];
            });

        return response()->json([
            'stats' => [
                'total_students' => $totalStudents,
                'pending_results' => $pendingResults,
                'notices' => $noticesCount,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }

    public function studentSummary(Request $request)
    {
        $user = $request->user();
        $results = Result::where('student_id', $user->id)->get();
        $totalPoints = $results->sum('point');
        $totalSubjects = $results->count();
        $cgpa = $totalSubjects > 0 ? round($totalPoints / $totalSubjects, 2) : 0;

        $fee = Fee::where('student_id', $user->id)
            ->latest()
            ->first();

        $notices = Notice::query()
            ->latest()
            ->take(5)
            ->get()
            ->map(function (Notice $notice) {
                return [
                    'id' => $notice->id,
                    'content' => $notice->content,
                    'created_at' => $notice->created_at,
                    'time_ago' => $notice->created_at?->diffForHumans(),
                ];
            });

        return response()->json([
            'stats' => [
                'cgpa' => $cgpa,
                'fee_status' => $fee?->status ?? 'not_assigned',
                'fee_semester' => $fee?->semester,
                'status' => $user->status ?? 'active',
            ],
            'notices' => $notices,
        ]);
    }
}
