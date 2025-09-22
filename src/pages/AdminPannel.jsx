import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFileVideo,
  FaFilePdf,
  FaImage,
  FaLink,
  FaSave,
  FaTimes,
  FaEye,
  FaLayerGroup,
  FaBook,
  FaPlayCircle
} from "react-icons/fa";

// Custom Hooks
const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

// Reusable Form Components
const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          Icon ? 'pl-10' : ''
        }`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
      <select
        value={value}
        onChange={onChange}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
          Icon ? 'pl-10' : ''
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  </div>
);

const ActionButton = ({ onClick, children, variant = "primary", icon: Icon, disabled = false }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant]
      }`}
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
};

// Entity Components
const ContentItem = ({ content, onDelete }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
    <div className="flex items-center gap-3">
      {content.type === "video" ? <FaFileVideo className="text-red-500" /> : <FaFilePdf className="text-red-600" />}
      <div>
        <span className="font-medium">{content.title}</span>
        <span className="ml-2 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full capitalize">
          {content.type}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <a
        href={content.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <FaEye />
      </a>
      <button
        onClick={() => onDelete(content.id)}
        className="p-2 text-red-600 hover:text-red-700 transition-colors"
      >
        <FaTrash />
      </button>
    </div>
  </div>
);

const ChapterItem = ({ chapter, isSelected, onSelect, onDelete }) => (
  <div
    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FaBook className="text-green-500" />
        <div>
          <h4 className="font-medium">{chapter.title}</h4>
          {chapter.description && (
            <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
          {chapter.chapter_contents?.length || 0} items
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chapter.id);
          }}
          className="p-1 text-red-600 hover:text-red-700 transition-colors"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </div>
);

const BatchItem = ({ batch, isSelected, onSelect, onDelete }) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FaLayerGroup className="text-purple-500" />
        <div>
          <h3 className="font-semibold">{batch.title}</h3>
          {batch.description && (
            <p className="text-sm text-gray-600 mt-1">{batch.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
          {batch.chapters?.length || 0} chapters
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(batch.id);
          }}
          className="p-1 text-red-600 hover:text-red-700 transition-colors"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </div>
);

const CourseItem = ({ course, isSelected, onSelect, onDelete }) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center gap-4">
      <img
        src={course.image || "https://source.unsplash.com/100x100/?education"}
        alt={course.title}
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {course.tag}
          </span>
        </div>
        <p className="text-gray-600 mt-1">{course.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{course.batches?.length || 0} batches</span>
          <span>•</span>
          <span>
            {course.batches?.reduce((total, batch) => total + (batch.chapters?.length || 0), 0)} chapters
          </span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(course.id);
        }}
        className="p-2 text-red-600 hover:text-red-700 transition-colors"
      >
        <FaTrash />
      </button>
    </div>
  </div>
);

// Main Form Sections
const AddCourseForm = ({ onSubmit, value, onChange }) => (
  <div className="bg-white rounded-xl shadow-lg border p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <FaPlus className="text-blue-500" />
      Add New Course
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      <InputField
        label="Course Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Enter course title"
        icon={FaPlayCircle}
      />
      <InputField
        label="Tag"
        value={value.tag}
        onChange={(e) => onChange({ ...value, tag: e.target.value })}
        placeholder="e.g., Programming, Design"
        icon={FaPlus}
      />
      <div className="md:col-span-2">
        <InputField
          label="Description"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="Enter course description"
        />
      </div>
      <div className="md:col-span-2">
        <InputField
          label="Image URL"
          value={value.image}
          onChange={(e) => onChange({ ...value, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
          icon={FaImage}
        />
      </div>
    </div>
    <div className="mt-4">
      <ActionButton onClick={onSubmit} icon={FaPlus} disabled={!value.title}>
        Add Course
      </ActionButton>
    </div>
  </div>
);

const AddBatchForm = ({ course, onSubmit, value, onChange }) => (
  <div className="bg-white rounded-xl shadow-lg border p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <FaLayerGroup className="text-green-500" />
      Add Batch to "{course.title}"
    </h2>
    <div className="space-y-4">
      <InputField
        label="Batch Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Enter batch title"
      />
      <InputField
        label="Description"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Enter batch description"
      />
    </div>
    <div className="mt-4">
      <ActionButton onClick={onSubmit} variant="success" icon={FaPlus} disabled={!value.title}>
        Add Batch
      </ActionButton>
    </div>
  </div>
);

const AddChapterForm = ({ batch, onSubmit, value, onChange }) => (
  <div className="bg-white rounded-xl shadow-lg border p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <FaBook className="text-yellow-500" />
      Add Chapter to "{batch.title}"
    </h2>
    <div className="space-y-4">
      <InputField
        label="Chapter Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Enter chapter title"
      />
      <InputField
        label="Description"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Enter chapter description"
      />
    </div>
    <div className="mt-4">
      <ActionButton onClick={onSubmit} variant="warning" icon={FaPlus} disabled={!value.title}>
        Add Chapter
      </ActionButton>
    </div>
  </div>
);

const AddContentForm = ({ chapter, onSubmit, value, onChange }) => (
  <div className="bg-white rounded-xl shadow-lg border p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <FaFileVideo className="text-purple-500" />
      Add Content to "{chapter.title}"
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      <InputField
        label="Content Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Enter content title"
      />
      <SelectField
        label="Content Type"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value })}
        options={[
          { value: "video", label: "Video" },
          { value: "pdf", label: "PDF" },
          { value: "audio", label: "Audio" },
          { value: "document", label: "Document" }
        ]}
        icon={FaFileVideo}
      />
      <div className="md:col-span-2">
        <InputField
          label="File URL"
          value={value.file_url}
          onChange={(e) => onChange({ ...value, file_url: e.target.value })}
          placeholder="https://drive.google.com/..."
          icon={FaLink}
        />
      </div>
    </div>
    <div className="mt-4">
      <ActionButton onClick={onSubmit} variant="secondary" icon={FaPlus} 
        disabled={!value.title || !value.file_url}>
        Add Content
      </ActionButton>
    </div>
  </div>
);

// Main Admin Panel Component
export default function AdminPanel() {
  const { courses, loading, error, refetch } = useCourses();
  const [newCourse, setNewCourse] = useState({ title: "", description: "", tag: "", image: "" });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newBatch, setNewBatch] = useState({ title: "", description: "" });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [newChapter, setNewChapter] = useState({ title: "", description: "" });
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [newContent, setNewContent] = useState({ title: "", type: "video", file_url: "" });

  const resetSelections = () => {
    setSelectedCourse(null);
    setSelectedBatch(null);
    setSelectedChapter(null);
  };

  const addCourse = async () => {
    if (!newCourse.title) return;
    try {
      await supabase.from("courses").insert([newCourse]);
      setNewCourse({ title: "", description: "", tag: "", image: "" });
      await refetch();
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const addBatch = async () => {
    if (!newBatch.title || !selectedCourse) return;
    try {
      await supabase.from("batches").insert([{ ...newBatch, course_id: selectedCourse.id }]);
      setNewBatch({ title: "", description: "" });
      await refetch();
    } catch (error) {
      console.error("Error adding batch:", error);
    }
  };

  const addChapter = async () => {
    if (!newChapter.title || !selectedBatch) return;
    try {
      await supabase.from("chapters").insert([{ ...newChapter, batch_id: selectedBatch.id }]);
      setNewChapter({ title: "", description: "" });
      await refetch();
    } catch (error) {
      console.error("Error adding chapter:", error);
    }
  };

  const addContent = async () => {
    if (!newContent.title || !newContent.file_url || !selectedChapter) return;
    try {
      await supabase.from("chapter_contents").insert([{ ...newContent, chapter_id: selectedChapter.id }]);
      setNewContent({ title: "", type: "video", file_url: "" });
      await refetch();
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const deleteEntity = async (entityType, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${entityType}?`)) return;
    
    try {
      await supabase.from(entityType).delete().eq("id", id);
      await refetch();
      // Reset selections if deleted entity was selected
      if (entityType === "courses" && selectedCourse?.id === id) resetSelections();
      if (entityType === "batches" && selectedBatch?.id === id) setSelectedBatch(null);
      if (entityType === "chapters" && selectedChapter?.id === id) setSelectedChapter(null);
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <ActionButton onClick={refetch} variant="primary">
            Retry
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage courses, batches, chapters, and content</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {courses.length} courses
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <AddCourseForm 
              onSubmit={addCourse}
              value={newCourse}
              onChange={setNewCourse}
            />

            {selectedCourse && (
              <AddBatchForm
                course={selectedCourse}
                onSubmit={addBatch}
                value={newBatch}
                onChange={setNewBatch}
              />
            )}

            {selectedBatch && (
              <AddChapterForm
                batch={selectedBatch}
                onSubmit={addChapter}
                value={newChapter}
                onChange={setNewChapter}
              />
            )}

            {selectedChapter && (
              <AddContentForm
                chapter={selectedChapter}
                onSubmit={addContent}
                value={newContent}
                onChange={setNewContent}
              />
            )}
          </div>

          {/* Right Column - Lists */}
          <div className="space-y-6">
            {/* Courses List */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Courses</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {courses.length} total
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {courses.map(course => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={selectedCourse?.id === course.id}
                    onSelect={() => {
                      setSelectedCourse(course);
                      setSelectedBatch(null);
                      setSelectedChapter(null);
                    }}
                    onDelete={() => deleteEntity("courses", course.id)}
                  />
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaPlayCircle className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No courses created yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Batches List */}
            {selectedCourse && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Batches in {selectedCourse.title}</h2>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {selectedCourse.batches?.length || 0} batches
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedCourse.batches?.map(batch => (
                    <BatchItem
                      key={batch.id}
                      batch={batch}
                      isSelected={selectedBatch?.id === batch.id}
                      onSelect={() => {
                        setSelectedBatch(batch);
                        setSelectedChapter(null);
                      }}
                      onDelete={() => deleteEntity("batches", batch.id)}
                    />
                  ))}
                  {(!selectedCourse.batches || selectedCourse.batches.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <FaLayerGroup className="text-2xl mx-auto mb-2 text-gray-300" />
                      <p>No batches created yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chapters List */}
            {selectedBatch && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Chapters in {selectedBatch.title}</h2>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                    {selectedBatch.chapters?.length || 0} chapters
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedBatch.chapters?.map(chapter => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      isSelected={selectedChapter?.id === chapter.id}
                      onSelect={() => setSelectedChapter(chapter)}
                      onDelete={() => deleteEntity("chapters", chapter.id)}
                    />
                  ))}
                  {(!selectedBatch.chapters || selectedBatch.chapters.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <FaBook className="text-2xl mx-auto mb-2 text-gray-300" />
                      <p>No chapters created yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contents List */}
            {selectedChapter && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Content in {selectedChapter.title}</h2>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                    {selectedChapter.chapter_contents?.length || 0} items
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedChapter.chapter_contents?.map(content => (
                    <ContentItem
                      key={content.id}
                      content={content}
                      onDelete={() => deleteEntity("chapter_contents", content.id)}
                    />
                  ))}
                  {(!selectedChapter.chapter_contents || selectedChapter.chapter_contents.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <FaFileVideo className="text-2xl mx-auto mb-2 text-gray-300" />
                      <p>No content added yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}