import Student from '../models/student.js';


/*export function getAllStudents(req, res) {
    Student.find().then(
        (students) => {
            console.log(students);
            res.json(students);
        }
    );
};*/


export async function getAllStudents(req, res) {

    try {
        const students = await Student.find();
        res.json(students);

    } catch (error) {
        console.error("Error fetching students:", error);
        return res.json({ message: "Internal server error" });
    }
};




export function createStudent(req, res) {

    if(isAdmin(req)){
        const student = new Student(
            {
                name : req.body.name,
                age : req.body.age,
                grade : req.body.grade
            }
        ); 

        student.save().then(
            (savedStudent) => {
                res.json(savedStudent);
            }   
        ).catch(
            (error) => {
                console.error("Error creating student:", error);
                return res.json({ message: "Internal server error" });
            }
        );

    }else{
        res.status(403).json({ message: "You need to login as an admin to create a student" });     
    }
};  


