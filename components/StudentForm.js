import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function StudentForm({
  _studentId,
  fname: existingFname = "",
  mname: existingMname = "",
  lname: existingLname = "",
  address: existingAddress = "",
  mobile: existingMobile = "",
  landline: existingLandline = "",
  facebook: existingFacebook = "",
  birthdate: existingBirthdate = "",
  birthplace: existingBirthplace = "",
  nationality: existingNationality = "",
  religion: existingReligion = "",
  sex: existingSex = "",
  father: existingFather = "",
  mother: existingMother = "",
  guardian: existingGuardian = "",
  guardianOccupation: existingGuardianOccupation = "",
  registrationDate: existingRegistrationDate = "",
  lrn: existingLrn = "",
  education: existingEducation = "",
  strand: existingStrand = "",
  course: existingCourse = "",
  yearLevel: existingYearLevel = "",
  schoolYear: existingSchoolYear = "",
  email: existingEmail = "",
  password: existingPassword = "",
}) {
  const [fname, setFname] = useState(existingFname);
  const [mname, setMname] = useState(existingMname);
  const [lname, setLname] = useState(existingLname);
  const [address, setAddress] = useState(existingAddress);
  const [mobile, setMobile] = useState(existingMobile);
  const [landline, setLandline] = useState(existingLandline);
  const [facebook, setFacebook] = useState(existingFacebook);
  const [birthdate, setBirthdate] = useState(existingBirthdate);
  const [birthplace, setBirthplace] = useState(existingBirthplace);
  const [nationality, setNationality] = useState(existingNationality);
  const [religion, setReligion] = useState(existingReligion);
  const [sex, setSex] = useState(existingSex);
  const [father, setFather] = useState(existingFather);
  const [mother, setMother] = useState(existingMother);
  const [guardian, setGuardian] = useState(existingGuardian);
  const [guardianOccupation, setGuardianOccupation] = useState(existingGuardianOccupation);
  const [registrationDate, setRegistrationDate] = useState(existingRegistrationDate);
  const [lrn, setLrn] = useState(existingLrn);
  const [education, setEducation] = useState(existingEducation);
  const [strand, setStrand] = useState(existingStrand);
  const [course, setCourse] = useState(existingCourse);
  const [yearLevel, setYearLevel] = useState(existingYearLevel);
  const [schoolYear, setSchoolYear] = useState(existingSchoolYear);
  const [email, setEmail] = useState(existingEmail);
  const [password, setPassword] = useState(existingPassword);
  const [goToStudents, setGoToStudents] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Props received in StudentForm:", {
      _studentId,
      fname,
      mname,
      lname,
      address,
      mobile,
      landline,
      facebook,
      birthdate,
      birthplace,
      nationality,
      religion,
      sex,
      father,
      mother,
      guardian,
      guardianOccupation,
      registrationDate,
      lrn,
      education,
      strand,
      course,
      yearLevel,
      schoolYear,
      email,
      password,
    });
  }, [
    _studentId,
    fname,
    mname,
    lname,
    address,
    mobile,
    landline,
    facebook,
    birthdate,
    birthplace,
    nationality,
    religion,
    sex,
    father,
    mother,
    guardian,
    guardianOccupation,
    registrationDate,
    lrn,
    education,
    strand,
    course,
    yearLevel,
    schoolYear,
    email,
    password,
  ]);

  async function saveStudent(ev) {
    ev.preventDefault();
    const data = {
      fname,
      mname,
      lname,
      address,
      mobile,
      landline,
      facebook,
      birthdate,
      birthplace,
      nationality,
      religion,
      sex,
      father,
      mother,
      guardian,
      guardianOccupation,
      registrationDate,
      lrn,
      education,
      strand,
      course,
      yearLevel,
      schoolYear,
      email,
      password,
    };

    try {
      const response = await fetch(`/api/students${_studentId ? `/${_studentId}` : ""}`, {
        method: _studentId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      setGoToStudents(true);
    } catch (error) {
      console.error("Error saving student:", error);
    }
  }

  if (goToStudents) {
    router.push("/students");
  }

  return (
    <form onSubmit={saveStudent}>
      <label>First Name</label>
      <input type="text" placeholder="Enter first name" value={fname} onChange={(ev) => setFname(ev.target.value)} required />

      <label>Middle Name</label>
      <input type="text" placeholder="Enter middle name" value={mname} onChange={(ev) => setMname(ev.target.value)} />

      <label>Last Name</label>
      <input type="text" placeholder="Enter last name" value={lname} onChange={(ev) => setLname(ev.target.value)} required />

      <label>Address</label>
      <input type="text" placeholder="Enter address" value={address} onChange={(ev) => setAddress(ev.target.value)} required />

      <label>Mobile Number</label>
      <input type="number" placeholder="Enter mobile number" value={mobile} onChange={(ev) => setMobile(ev.target.value)} required />

      <label>Landline Number</label>
      <input type="number" placeholder="Enter landline number" value={landline} onChange={(ev) => setLandline(ev.target.value)} />

      <label>Facebook</label>
      <input type="text" placeholder="Enter Facebook link" value={facebook} onChange={(ev) => setFacebook(ev.target.value)} />

      <label>Date of Birth</label>
      <input type="date" value={birthdate} onChange={(ev) => setBirthdate(ev.target.value)} required />

      <label>Place of Birth</label>
      <input type="text" placeholder="Enter place of birth" value={birthplace} onChange={(ev) => setBirthplace(ev.target.value)} required />

      <label>Nationality</label>
      <input type="text" placeholder="Enter nationality" value={nationality} onChange={(ev) => setNationality(ev.target.value)} required />

      <label>Religion</label>
      <input type="text" placeholder="Enter religion" value={religion} onChange={(ev) => setReligion(ev.target.value)} required />

      <label>Sex</label>
      <select value={sex} onChange={(ev) => setSex(ev.target.value)} required>
        <option value="">Select Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <label>Fathers Name</label>
      <input type="text" placeholder="Enter father's name" value={father} onChange={(ev) => setFather(ev.target.value)} required />

      <label>Mothers Name</label>
      <input type="text" placeholder="Enter mother's name" value={mother} onChange={(ev) => setMother(ev.target.value)} required />

      <label>Guardians Name</label>
      <input type="text" placeholder="Enter guardian's name" value={guardian} onChange={(ev) => setGuardian(ev.target.value)} required />

      <label>Guardians Occupation</label>
      <input type="text" placeholder="Enter guardian's occupation" value={guardianOccupation} onChange={(ev) => setGuardianOccupation(ev.target.value)} required />

      <label>Registration Date</label>
      <input type="date" value={registrationDate} onChange={(ev) => setRegistrationDate(ev.target.value)} required />

      <label>LRN</label>
      <input type="number" placeholder="Enter LRN" value={lrn} onChange={(ev) => setLrn(ev.target.value)} required />

      <label>Education Level</label>
      <select value={education} onChange={(ev) => setEducation(ev.target.value)} required>
        <option value="">Select Education Level</option>
        <option value="elementary">Elementary</option>
        <option value="junior-high">Junior High</option>
        <option value="senior-high">Senior High</option>
        <option value="college">College</option>
      </select>
      {education === "senior-high" && (
        <>
          <label>Strand</label>
          <input
            type="text"
            placeholder="Enter Strand"
            value={strand}
            onChange={(ev) => setStrand(ev.target.value)}
            required
          />
        </>
      )}
      {education === "college" && (
        <>
          <label>Course</label>
          <input
            type="text"
            placeholder="Enter Course"
            value={course}
            onChange={(ev) => setCourse(ev.target.value)}
            required
          />
        </>
      )}

      <label>Year Level</label>
      <input type="number" placeholder="Enter Year Level" value={yearLevel} onChange={(ev) => setYearLevel(ev.target.value)} required />

      <label>school Year</label>
      <input type="number" placeholder="Enter School Year" value={schoolYear} onChange={(ev) => setSchoolYear(ev.target.value)} required />

      <label>Email</label>
      <input type="email" placeholder="Enter email" value={email} onChange={(ev) => setEmail(ev.target.value)} required />

      <label>Password</label>
      <input type="password" placeholder="Enter password" value={password} onChange={(ev) => setPassword(ev.target.value)} required />

      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}

