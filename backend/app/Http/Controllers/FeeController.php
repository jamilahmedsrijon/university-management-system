<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fee;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeController extends Controller
{
    // Return current semester
    private function getCurrentSemester()
    {
        return "Spring 2026";
    }

    // Teacher: Create fee with dynamic amount
    public function createFee(Request $request, $studentId)
    {
        // Validate amount
        $request->validate([
            'amount' => 'required|numeric|min:0'
        ]);

        // Check if fee already exists for this semester
        $exists = Fee::where('student_id', $studentId)
            ->where('semester', $this->getCurrentSemester())
            ->first();

        if ($exists) {
            return response()->json([
                'message' => 'Fee already exists'
            ], 400);
        }

        // Create new fee
        $fee = Fee::create([
            'student_id' => $studentId,
            'semester' => $this->getCurrentSemester(),
            'amount' => $request->amount,
            'status' => 'unpaid'
        ]);

        return response()->json([
            'message' => 'Fee created',
            'data' => $fee
        ]);
    }

    // Student: View own fee
    public function myFee()
    {
        $fee = Fee::where('student_id', Auth::id())
            ->where('semester', $this->getCurrentSemester())
            ->first();

        return response()->json([
            'fee' => $fee
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

        // Ensure current semester
        if ($fee->semester !== $this->getCurrentSemester()) {
            return response()->json([
                'message' => 'You can only pay current semester fee'
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
    public function downloadAdmitCard()
    {
        $semester = $this->getCurrentSemester();

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
            'exam' => 'Final Exam',
            'date' => now()->format('d M Y')
        ];

        $pdf = Pdf::loadView('admit', $data);

        return $pdf->download('admit-card.pdf');
    }
}