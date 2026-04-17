<!DOCTYPE html>
<html>
<head>
    <title>Receipt</title>
</head>
<body>

    <h2>{{ $university }}</h2>

    <p><strong>Name:</strong> {{ $student_name }}</p>
    <p><strong>ID:</strong> {{ $student_id }}</p>
    <p><strong>Semester:</strong> {{ $semester }}</p>
    <p><strong>Amount:</strong> {{ $amount }} TK</p>
    <p><strong>Method:</strong> {{ $payment_method }}</p>
    <p><strong>Status:</strong> {{ $status }}</p>
    <p><strong>Date:</strong> {{ $date }}</p>

    <hr>
    <p>Payment Successful</p>

</body>
</html>