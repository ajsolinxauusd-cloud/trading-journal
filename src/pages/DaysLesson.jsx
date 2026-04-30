import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

export default function DaysLesson() {
  const [lessons, setLessons] = useState([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    chart1: "",
    chart2: "",
    chart3: "",
    lesson: "",
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    const q = query(collection(db, "lessons"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setLessons(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "lessons"), {
      date: form.date,
      charts: [form.chart1, form.chart2, form.chart3],
      lesson: form.lesson,
    });

    // Reset form
    setForm({
      date: new Date().toISOString().split("T")[0],
      chart1: "",
      chart2: "",
      chart3: "",
      lesson: "",
    });

    fetchLessons();
  };

  return (
    <div>

      <h1 className="text-3xl mb-6">Day’s Lesson</h1>

      {/* 📝 FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-xl mb-6"
      >

        <input
          type="date"
          className="block mb-2 p-2 text-black w-full"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <input
          placeholder="Chart Link 1"
          className="block mb-2 p-2 text-black w-full"
          value={form.chart1}
          onChange={(e) =>
            setForm({ ...form, chart1: e.target.value })
          }
        />

        <input
          placeholder="Chart Link 2"
          className="block mb-2 p-2 text-black w-full"
          value={form.chart2}
          onChange={(e) =>
            setForm({ ...form, chart2: e.target.value })
          }
        />

        <input
          placeholder="Chart Link 3"
          className="block mb-2 p-2 text-black w-full"
          value={form.chart3}
          onChange={(e) =>
            setForm({ ...form, chart3: e.target.value })
          }
        />

        <textarea
          placeholder="Write today's lesson..."
          className="block mb-2 p-2 text-black w-full"
          value={form.lesson}
          onChange={(e) =>
            setForm({ ...form, lesson: e.target.value })
          }
        />

        <button className="bg-white text-black px-4 py-2 w-full">
          Save Lesson
        </button>

      </form>

      {/* 📚 DISPLAY */}
      {lessons.map((item) => (
        <div key={item.id} className="bg-gray-900 p-4 mb-4 rounded-xl">

          <h2 className="text-lg mb-2">{item.date}</h2>

          {/* 📊 Chart Links */}
          {item.charts?.map((link, i) => (
            link && (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="block text-blue-400 underline"
              >
                Chart {i + 1}
              </a>
            )
          ))}

          {/* 🧠 Lesson */}
          <p className="mt-2 text-gray-300 whitespace-pre-line">
            {item.lesson}
          </p>

        </div>
      ))}

    </div>
  );
}