import { CDBIcon } from "cdbreact";
import { Card, Col, Container, Row } from "react-bootstrap";
import type { Course } from "../types/common.types";
import { useState } from "react";

interface CountCardProps {
  course: Course;
  submitCallback: (item: Course) => void;
  cancelCallback: () => void;
}

export const CourseComponent: React.FC<CountCardProps> = ({
  course,
  submitCallback,
  cancelCallback,
}) => {
  const [newCourse, setNewCourse] = useState<Course>(course);
  const [dateError, setDateError] = useState<string>("");

  const getImage = async (file: File): Promise<any> => {
    if (file) {
      return await convertToBase64(file)
        .then((base64) => base64)
        .catch((err) =>
          console.error("Error converting image to base64:", err)
        );
    } else return "";
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read file as base64
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result); // This is the base64 string
        } else {
          reject("Base64 conversion failed");
        }
      };
      reader.onerror = reject;
    });
  };

  const validateDates = (): string => {
    if (newCourse.startDate && newCourse.endDate) {
      const startDate = new Date(newCourse.startDate);
      const endDate = new Date(newCourse.endDate);

      if (startDate >= endDate) {
        return "Start date must be before end date";
      }
    }
    return "";
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateDates();
    if (validationError) {
      setDateError(validationError);
      return;
    }

    setDateError("");
    submitCallback(newCourse);
  };

  const handleCourseInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let { name, value } = e.target;

    // convert the file to base64 string
    if (
      name == "imageUrl" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      value = await getImage(e.target.files?.[0]);
    }

    setNewCourse((prev) => ({ ...prev, [name]: value }));

    // Clear date error when dates are changed
    if (name === "startDate" || name === "endDate") {
      setDateError("");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "1000px", width: "100%" }}
      >
        <form onSubmit={handleSubmitCourse}>
          <div className="mb-3">
            <label htmlFor="dateOfBirth" className="form-label">
              Course Title
            </label>
            <input
              className="form-control"
              name="title"
              value={newCourse.title}
              onChange={handleCourseInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="dateOfBirth" className="form-label">
              Course Description
            </label>
            <input
              className="form-control"
              name="description"
              value={newCourse.description}
              onChange={handleCourseInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="quota" className="form-label">
              Quota
            </label>
            <input
              className="form-control"
              name="quota"
              value={newCourse.quota}
              type="number"
              onChange={handleCourseInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="instructor" className="form-label">
              Instructor
            </label>
            <input
              className="form-control"
              name="instructor"
              value={newCourse.instructor}
              onChange={handleCourseInputChange}
            />
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                aria-label="startDate"
                type="date"
                name="startDate"
                value={newCourse.startDate?.toString().substring(0, 10)}
                className="form-control"
                required
                onChange={handleCourseInputChange}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <input
                aria-label="endDate"
                type="date"
                name="endDate"
                value={newCourse.endDate?.toString().substring(0, 10)}
                className="form-control"
                required
                onChange={handleCourseInputChange}
              />
            </div>
          </div>
          {dateError && (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {dateError}
              </div>
            </div>
          )}
          <div className="mb-3">
            <input
              type="file"
              name="imageUrl"
              className="form-control"
              onChange={handleCourseInputChange}
            />
            {course?.imageUrl && <img src={course?.imageUrl} />}
          </div>
          <button className="btn btn-primary mr-3" type="submit">
            {course?._id ? "Update" : "Add"} Course
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={cancelCallback}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
