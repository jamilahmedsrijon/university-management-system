<!DOCTYPE html>
<html>
<head>
    <title>Admit Card</title>
</head>
<body>

    <h2>{{ $university }}</h2>
    <h3>Admit Card</h3>

    <p><strong>Name:</strong> {{ $student_name }}</p>
    <p><strong>ID:</strong> {{ $student_id }}</p>
    <p><strong>Semester:</strong> {{ $semester }}</p>
    <p><strong>Exam:</strong> {{ $exam }}</p>
    <p><strong>Date:</strong> {{ $date }}</p>

    <hr>
    <p>Authorized for Final Examination</p>

</body>
</html>