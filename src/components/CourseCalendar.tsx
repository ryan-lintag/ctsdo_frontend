import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { Card, Badge, Alert } from "react-bootstrap";
import type { Course } from "../types/common.types";
import "react-calendar/dist/Calendar.css";
import "./CourseCalendar.css";

interface CourseCalendarProps {
  courses: Course[];
  selectedCourse?: Course | null;
}

interface CalendarTileProps {
  date: Date;
  view: string;
}

export const CourseCalendar: React.FC<CourseCalendarProps> = ({
  courses,
  selectedCourse,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [coursesForDate, setCoursesForDate] = useState<Course[]>([]);

  // Filter courses for the selected date
  useEffect(() => {
    const filteredCourses = courses.filter((course) => {
      if (!course.startDate || !course.endDate) return false;

      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      return selectedDate >= startDate && selectedDate <= endDate;
    });

    setCoursesForDate(filteredCourses);
  }, [selectedDate, courses]);

  // Function to determine if a date has courses
  const hasCoursesOnDate = (date: Date): boolean => {
    return courses.some((course) => {
      if (!course.startDate || !course.endDate) return false;

      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      return date >= startDate && date <= endDate;
    });
  };

  // Function to get course status for a date
  const getCourseStatusForDate = (
    date: Date
  ): "active" | "upcoming" | "expired" | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const coursesOnDate = courses.filter((course) => {
      if (!course.startDate || !course.endDate) return false;

      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      return date >= startDate && date <= endDate;
    });

    if (coursesOnDate.length === 0) return null;

    // Check if any course is currently active
    const hasActiveCourse = coursesOnDate.some((course) => {
      const startDate = new Date(course.startDate!);
      const endDate = new Date(course.endDate!);
      return today >= startDate && today <= endDate;
    });

    if (hasActiveCourse) return "active";

    // Check if all courses are upcoming
    const allUpcoming = coursesOnDate.every((course) => {
      const startDate = new Date(course.startDate!);
      return today < startDate;
    });

    if (allUpcoming) return "upcoming";

    return "expired";
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: CalendarTileProps) => {
    if (view === "month") {
      const status = getCourseStatusForDate(date);
      if (status) {
        return (
          <div className={`calendar-tile-indicator ${status}`}>
            <div className="indicator-dot"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Custom tile class name
  const tileClassName = ({ date, view }: CalendarTileProps) => {
    if (view === "month") {
      const status = getCourseStatusForDate(date);
      if (status) {
        return `has-courses ${status}`;
      }
    }
    return "";
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCourseProgress = (course: Course): number => {
    if (!course.startDate || !course.endDate) return 0;

    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const today = new Date();

    if (today < startDate) return 0;
    if (today > endDate) return 100;

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  };

  const getCourseStatusBadge = (course: Course) => {
    const today = new Date();
    const startDate = new Date(course.startDate!);
    const endDate = new Date(course.endDate!);

    if (today < startDate) {
      return <Badge bg="info">Upcoming</Badge>;
    } else if (today > endDate) {
      return <Badge bg="secondary">Expired</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  return (
    <div className="course-calendar-container">
      <div className="row">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Course Timeline Calendar</h5>
              <small className="text-muted">
                Click on any date to see courses available on that day
              </small>
            </Card.Header>
            <Card.Body>
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="course-calendar"
              />

              <div className="calendar-legend mt-3">
                <h6>Legend:</h6>
                <div className="d-flex gap-3 flex-wrap">
                  <div className="legend-item">
                    <span className="legend-dot active"></span>
                    <small>Active Courses</small>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot upcoming"></span>
                    <small>Upcoming Courses</small>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot expired"></span>
                    <small>Expired Courses</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Courses on {formatDate(selectedDate)}</h6>
            </Card.Header>
            <Card.Body>
              {coursesForDate.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No courses scheduled for this date.
                </Alert>
              ) : (
                <div className="courses-list">
                  {coursesForDate.map((course) => (
                    <Card key={course._id} className="mb-3 course-card">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{course.title}</h6>
                          {getCourseStatusBadge(course)}
                        </div>

                        <p className="text-muted small mb-2">
                          {course.description}
                        </p>

                        <div className="course-details">
                          <small className="text-muted d-block">
                            <strong>Instructor:</strong>{" "}
                            {course.instructor || "TBA"}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Duration:</strong>{" "}
                            {new Date(course.startDate!).toLocaleDateString()} -{" "}
                            {new Date(course.endDate!).toLocaleDateString()}
                          </small>
                          <small className="text-muted d-block">
                            <strong>Quota:</strong>{" "}
                            {course.quota || "Unlimited"}
                          </small>
                        </div>

                        <div className="progress-section mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Progress</small>
                            <small className="text-muted">
                              {getCourseProgress(course)}%
                            </small>
                          </div>
                          <div className="progress" style={{ height: "4px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${getCourseProgress(course)}%` }}
                            ></div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};
