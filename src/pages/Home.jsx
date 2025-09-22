import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaUser, 
  FaPlay, 
  FaFileAlt,
  FaVideo,
  FaHeadphones,
  FaExternalLinkAlt,
  FaPlus,
  FaSearch
} from "react-icons/fa";

// Custom Hooks for better separation of concerns
const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error.message);
      return;
    }
    if (!user) {
      setUserProfile(null);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
    } else {
      setUserProfile(data);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription?.unsubscribe();
  }, [fetchProfile]);

  return userProfile;
};

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

// Reusable Components
const UserAvatar = ({ userProfile, onAuthClick, onAdminNavigate }) => {
  if (!userProfile) {
    return (
      <button
        onClick={() => onAuthClick("login")}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md sm:shadow-lg"
      >
        <FaUser className="text-sm sm:text-base" />
        <span className="hidden sm:inline">Login / Sign up</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
      {userProfile.role === "admin" && (
        <button
          onClick={onAdminNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-white text-sm sm:text-base hover:bg-gray-900 transition-all duration-200 shadow-md sm:shadow-lg"
        >
          <FaPlus className="text-sm sm:text-base" />
          <span className="hidden sm:inline">Admin Dashboard</span>
        </button>
      )}

      <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-sm text-sm sm:text-base">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
          {userProfile.name?.[0]?.toUpperCase() || <FaUser />}
        </div>
        <span className="truncate max-w-[60px] sm:max-w-[150px]">{userProfile.name}</span>
      </div>
    </div>
  );
};


const ContentIcon = ({ type }) => {
  const icons = {
    video: FaVideo,
    document: FaFileAlt,
    audio: FaHeadphones,
    default: FaFileAlt
  };
  
  const IconComponent = icons[type] || icons.default;
  return <IconComponent className="text-blue-500 flex-shrink-0" />;
};

const ChapterContent = ({ content }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 group">
    <div className="flex items-center gap-3">
      <ContentIcon type={content.type} />
      <div>
        <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
          {content.title}
        </span>
        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
          {content.type}
        </span>
      </div>
    </div>
    <a
      href={content.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
    >
      Preview
      <FaExternalLinkAlt className="text-xs" />
    </a>
  </div>
);

const ChapterItem = ({ chapter }) => (
  <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <h4 className="font-semibold text-gray-800 text-lg">{chapter.title}</h4>
    </div>
    
    {chapter.chapter_contents?.length > 0 ? (
      <div className="space-y-2">
        {chapter.chapter_contents.map(content => (
          <ChapterContent key={content.id} content={content} />
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm italic">No content available</p>
    )}
  </div>
);

const BatchItem = ({ batch, isExpanded, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h3 className="font-semibold text-gray-800 text-lg">{batch.title}</h3>
      </div>
      {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
    </button>
    
    {isExpanded && (
      <div className="px-4 pb-4">
        {batch.chapters?.length > 0 ? (
          <div className="space-y-3">
            {batch.chapters.map(chapter => (
              <ChapterItem key={chapter.id} chapter={chapter} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No chapters available</p>
        )}
      </div>
    )}
  </div>
);

const CourseCard = ({ 
  course, 
  isExpanded, 
  expandedBatch, 
  onCourseToggle, 
  onBatchToggle 
}) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
    <div className="relative">
      <img
        src={course.image || "https://source.unsplash.com/600x300/?education,learning"}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-4 right-4">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          {course.tag}
        </span>
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
      
      <button
        onClick={onCourseToggle}
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
      >
        <FaPlay className="text-sm" />
        {isExpanded ? "Hide Details" : "View Course"}
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {course.batches?.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 text-lg">Available Batches</h4>
              {course.batches.map(batch => (
                <BatchItem
                  key={batch.id}
                  batch={batch}
                  isExpanded={expandedBatch === batch.id}
                  onToggle={() => onBatchToggle(batch.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No batches available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-300"></div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          <div className="h-12 bg-gray-300 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Main Component
export default function Home({ onAuthClick }) {
  const navigate = useNavigate();
  const userProfile = useUserProfile();
  const { courses, loading, error } = useCourses();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCourseToggle = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
    setExpandedBatch(null);
  };

  const handleBatchToggle = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                EH
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduHub
              </h1>
            </div>
            
            <UserAvatar 
              userProfile={userProfile} 
              onAuthClick={onAuthClick}
              onAdminNavigate={() => navigate("/admin")}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Discover Your Next{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our comprehensive collection of courses designed to help you grow and succeed in your career.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Courses
              <span className="text-gray-500 text-lg ml-3">
                ({filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'})
              </span>
            </h2>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isExpanded={expandedCourse === course.id}
                  expandedBatch={expandedBatch}
                  onCourseToggle={() => handleCourseToggle(course.id)}
                  onBatchToggle={handleBatchToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
              <p className="text-gray-600">
                {searchTerm ? `No courses match "${searchTerm}"` : "No courses available at the moment"}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p>© 2025 EduHub. All rights reserved. Empowering learners worldwide.</p>
        </div>
      </footer>
    </div>
  );
}