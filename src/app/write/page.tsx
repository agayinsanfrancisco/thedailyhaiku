import Calendar from "@/components/Calendar";

export default function WritePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pick a Date
        </h1>
        <p className="text-gray-600">
          Green dates are open for new haikus. Pick one and get inspired!
        </p>
      </div>
      <Calendar />
    </div>
  );
}
