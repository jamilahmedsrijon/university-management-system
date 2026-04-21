<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    private function availableDepartments(): array
    {
        return User::query()
            ->where('role', 'student')
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department')
            ->values()
            ->all();
    }

    private function availableSemesters(): array
    {
        return [
            'Spring 2026',
            'Summer 2026',
            'Fall 2026',
        ];
    }

    private function defaultSemester(): string
    {
        return $this->availableSemesters()[0];
    }

    private function resolveSemester(?string $semester): string
    {
        return in_array($semester, $this->availableSemesters(), true)
            ? $semester
            : $this->defaultSemester();
    }

    public function students(Request $request): JsonResponse
    {
        $selectedSemester = $this->resolveSemester($request->query('semester'));
        $selectedDepartment = $request->query('department');

        $studentsQuery = User::query()
            ->where('role', 'student')
            ->with([
                'fees' => function ($query) use ($selectedSemester) {
                    $query
                        ->where('semester', $selectedSemester)
                        ->latest();
                },
            ])
            ->latest();

        if ($selectedDepartment) {
            $studentsQuery->where('department', $selectedDepartment);
        }

        $students = $studentsQuery
            ->get([
                'id',
                'name',
                'email',
                'department',
                'session',
                'status',
                'created_at',
            ])
            ->map(function (User $student) {
                /** @var Fee|null $currentFee */
                $currentFee = $student->fees->first();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'department' => $student->department,
                    'session' => $student->session,
                    'status' => $student->status,
                    'created_at' => $student->created_at,
                    'current_fee' => $currentFee ? [
                        'id' => $currentFee->id,
                        'semester' => $currentFee->semester,
                        'amount' => $currentFee->amount,
                        'status' => $currentFee->status,
                        'payment_method' => $currentFee->payment_method,
                    ] : null,
                ];
            });

        return response()->json([
            'students' => $students,
            'selected_semester' => $selectedSemester,
            'available_semesters' => $this->availableSemesters(),
            'selected_department' => $selectedDepartment,
            'available_departments' => $this->availableDepartments(),
        ]);
    }
}
