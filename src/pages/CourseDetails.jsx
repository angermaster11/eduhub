import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    const { data } = await supabase
      .from("courses")
      .select(`
        *,
        batches (
          *,
          chapters (
            *,
            chapter_contents (*)
          )
        )
      `)
      .eq("id", id)
      .single();
    setCourse(data);
  };

  if (!course) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {course.batches?.map(batch => (
        <div key={batch.id} className="border rounded mb-4">
          <div
            className="p-3 flex justify-between cursor-pointer font-semibold bg-gray-100 hover:bg-gray-200"
            onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
          >
            {batch.title}
            {expandedBatch === batch.id ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {expandedBatch === batch.id && batch.chapters?.map(chapter => (
            <div key={chapter.id} className="pl-4 py-2 border-t bg-gray-50 space-y-1">
              <h3 className="font-medium">{chapter.title}</h3>
              {chapter.chapter_contents?.map(content => (
                <div key={content.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm mt-1">
                  <span>{content.title} ({content.type})</span>
                  <a href={content.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Preview
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
