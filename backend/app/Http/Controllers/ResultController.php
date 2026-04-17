<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Result;

class ResultController extends Controller
{
    private function calculateGrade($marks)
    {
        if ($marks >= 80) return ['grade' => 'A+', 'point' => 4.00];
        elseif ($marks >= 75) return ['grade' => 'A', 'point' => 3.75];
        elseif ($marks >= 70) return ['grade' => 'A-', 'point' => 3.50];
        elseif ($marks >= 65) return ['grade' => 'B+', 'point' => 3.25];
        elseif ($marks >= 60) return ['grade' => 'B', 'point' => 3.00];
        elseif ($marks >= 55) return ['grade' => 'B-', 'point' => 2.75];
        elseif ($marks >= 50) return ['grade' => 'C+', 'point' => 2.50];
        elseif ($marks >= 45) return ['grade' => 'C', 'point' => 2.25];
        elseif ($marks >= 40) return ['grade' => 'D', 'point' => 2.00];
        else return ['grade' => 'F', 'point' => 0.00];
    }

    // Teacher: Add Result
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject' => 'required|string',
            'marks' => 'required|integer'
        ]);

        $gradeData = $this->calculateGrade($request->marks);

        $result = Result::create([
            'student_id' => $request->student_id,
            'subject' => $request->subject,
            'marks' => $request->marks,
            'grade' => $gradeData['grade'],
            'point' => $gradeData['point']
        ]);

        return response()->json([
            'message' => 'Result added successfully',
            'data' => $result
        ]);
    }

    // Student: View Own Result + CGPA
    public function myResults(Request $request)
    {
        $results = Result::where('student_id', $request->user()->id)->get();

        $totalPoints = $results->sum('point');
        $totalSubjects = $results->count();

        $cgpa = $totalSubjects > 0 ? $totalPoints / $totalSubjects : 0;

        return response()->json([
            'results' => $results,
            'cgpa' => round($cgpa, 2)
        ]);
    }
}