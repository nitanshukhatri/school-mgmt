const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudentRecord } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, className, section, roll } = req.query;
    const students = await getAllStudents({ name, className, section, roll });
    res.status(200).json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const payload = req.body;
    const message = await addNewStudent(payload);
    res.status(201).json(message);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const payload = req.body;
    const message = await updateStudent({ ...payload, userId });
    res.status(200).json(message);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(id);
    res.status(200).json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const payload = req.body;
    const { id: userId } = req.params;
    const { id: reviewerId } = req.user;
    if (!reviewerId) {
        return res.status(401).json({ error: "Unauthorized: reviewer ID not found in token" });
    }
    const message = await setStudentStatus({ ...payload, userId, reviewerId });
    res.status(200).json(message);
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await deleteStudentRecord(id);
    res.status(200).json(message);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
