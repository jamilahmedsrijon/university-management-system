<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FeeController extends Controller
{
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

    // Teacher: Create fee with dynamic amount
    public function createFee(Request $request, $studentId)
    {
        // Validate amount
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'semester' => ['required', 'string', Rule::in($this->availableSemesters())],
        ]);

        $student = User::where('id', $studentId)
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        $semester = $this->resolveSemester($request->semester);

        // Check if fee already exists for this semester
        $exists = Fee::where('student_id', $studentId)
            ->where('semester', $semester)
            ->first();

        if ($exists) {
            return response()->json([
                'message' => 'Fee already exists'
            ], 400);
        }

        // Create new fee
        $fee = Fee::create([
            'student_id' => $student->id,
            'semester' => $semester,
            'amount' => $request->amount,
            'status' => 'unpaid'
        ]);

        return response()->json([
            'message' => 'Fee created',
            'data' => $fee
        ]);
    }

    // Teacher: Update fee amount for current semester
    public function updateFee(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0'
        ]);

        $fee = Fee::findOrFail($id);

        if ($fee->status === 'paid') {
            return response()->json([
                'message' => 'Paid fee cannot be updated'
            ], 400);
        }

        $fee->update([
            'amount' => $request->amount,
        ]);

        return response()->json([
            'message' => 'Fee updated successfully',
            'data' => $fee->fresh()
        ]);
    }

    // Student: View own fee
    public function myFee(Request $request)
    {
        $semester = $this->resolveSemester($request->query('semester'));

        $fee = Fee::where('student_id', Auth::id())
            ->where('semester', $semester)
            ->first();

        return response()->json([
            'fee' => $fee,
            'selected_semester' => $semester,
            'available_semesters' => $this->availableSemesters(),
        ]);
    }

    // Student: Pay fee
    public function payFee(Request $request, $id)
    {
        // Validate payment method
        $request->validate([
            'payment_method' => 'required|in:bank,mobile,card'
        ]);

        $fee = Fee::findOrFail($id);

        // Ensure student is paying own fee
        if ($fee->student_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Update fee status
        $fee->update([
            'status' => 'paid',
            'payment_method' => $request->payment_method
        ]);

        return response()->json([
            'message' => 'Payment successful',
            'data' => $fee
        ]);
    }

    // Download PDF receipt
    public function downloadReceipt($id)
    {
        $fee = Fee::findOrFail($id);

        // Ensure student owns this fee
        if ($fee->student_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $student = User::find($fee->student_id);

        $data = [
            'university' => 'My University',
            'student_name' => $student->name,
            'student_id' => $student->id,
            'semester' => $fee->semester,
            'amount' => $fee->amount,
            'payment_method' => $fee->payment_method,
            'status' => $fee->status,
            'date' => now()->format('d M Y')
        ];

        $pdf = Pdf::loadView('receipt', $data);

        return $pdf->download('receipt.pdf');
    }

    // Download admit card (only if fee is paid)
    public function admitCardInfo(Request $request)
    {
        $semester = $this->resolveSemester($request->query('semester'));

        $fee = Fee::where('student_id', Auth::id())
            ->where('semester', $semester)
            ->where('status', 'paid')
            ->first();

        if (!$fee) {
            return response()->json([
                'message' => 'Please pay semester fee first'
            ], 403);
        }

        $student = User::find(Auth::id());

        return response()->json([
            'admit_card' => [
                'university' => 'ABC University',
                'student_name' => $student->name,
                'student_id' => $student->id,
                'department' => $student->department,
                'semester' => $semester,
                'exam' => "{$semester} Final Exam",
                'status' => $student->status,
            ]
        ]);
    }

    // Download admit card (only if fee is paid)
    public function downloadAdmitCard(Request $request)
    {
        $semester = $this->resolveSemester($request->query('semester'));

        $fee = Fee::where('student_id', Auth::id())
            ->where('semester', $semester)
            ->where('status', 'paid')
            ->first();

        if (!$fee) {
            return response()->json([
                'message' => 'Please pay semester fee first'
            ], 403);
        }

        $student = User::find(Auth::id());

        $data = [
            'university' => 'My University',
            'student_name' => $student->name,
            'student_id' => $student->id,
            'semester' => $semester,
            'exam' => "{$semester} Final Exam",
            'date' => now()->format('d M Y')
        ];

        $pdf = Pdf::loadView('admit', $data);

        return $pdf->download('admit-card.pdf');
    }
}
