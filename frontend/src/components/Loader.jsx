function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      <p className="mt-3 text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

export default Loader;
