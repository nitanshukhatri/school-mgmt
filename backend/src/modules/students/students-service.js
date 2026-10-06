const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudent } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    if (!id) {
        throw new ApiError(400, "Student ID is required");
    }
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    if (students.length <= 0) {
        throw new ApiError(404, "Students not found");
    }

    return students;
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    if (!payload || !payload.name || !payload.email) {
        throw new ApiError(400, "Student name and email are required");
    }

    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(400, result.message || "Unable to add student");
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            console.error("Email send error:", error);
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error("Add student error:", error);
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    if (!payload || !payload.userId) {
        throw new ApiError(400, "Student ID is required");
    }

    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(400, result.message || "Unable to update student");
    }
    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    if (status === undefined || status === null) {
        throw new ApiError(400, "Status is required");
    }

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to update student status");
    }

    return { message: "Student status changed successfully" };
}

const deleteStudentRecord = async (id) => {
    await checkStudentId(id);

    const affectedRow = await deleteStudent(id);
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to delete student");
    }

    return { message: "Student deleted successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudentRecord
};
