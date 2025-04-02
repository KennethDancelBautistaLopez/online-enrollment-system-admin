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
  const [registrationDate, setRegistrationDate] = useState(
    existingRegistrationDate ? existingRegistrationDate.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [lrn, setLrn] = useState(existingLrn);
  const [education, setEducation] = useState(existingEducation);
  const [strand, setStrand] = useState(existingStrand);
  const [course, setCourse] = useState(existingCourse);
  const [yearLevel, setYearLevel] = useState(existingYearLevel);
  const [schoolYear, setSchoolYear] = useState(existingSchoolYear);
  const [email, setEmail] = useState(existingEmail);
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
  ]);

  async function saveStudent(ev) {
    ev.preventDefault();
    const data = {
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
    };
    
    console.log("Data being sent:", data);
      try {
        const response = await axios({
          method: _studentId ? "PUT" : "POST",
          url: _studentId ? `/api/students?id=${_studentId}` : "/api/students",  // ✅ Change `_studentId` to `id`
          data,
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.status >= 200 && response.status < 300) {
          setGoToStudents(true);
        }
      } catch (error) {
        console.error('Error saving student:', error.response ? error.response.data : error.message);
      }
  }

  useEffect(() => {
    if (goToStudents) {
      router.push("/students");
    }
  }, [goToStudents, router]);

  return (
    <form onSubmit={saveStudent}>
      <label>First Name</label>
      <input type="text" placeholder="Enter first name" value={fname} onChange={(ev) => setFname(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Middle Name</label>
      <input type="text" placeholder="Enter middle name" value={mname} onChange={(ev) => setMname(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} />

      <label>Last Name</label>
      <input type="text" placeholder="Enter last name" value={lname} onChange={(ev) => setLname(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Address</label>
      <input type="text" placeholder="Enter address" value={address} onChange={(ev) => setAddress(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Mobile Number</label>
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(ev) => {
            let input = ev.target.value.replace(/\D/g, ""); // Remove non-numeric characters

            if (input.length > 11) input = input.slice(0, 11); // Limit to 11 digits

            // Format input as 0902-232-2322
            if (input.length > 7) {
              input = input.replace(/^(\d{4})(\d{3})(\d{0,4})$/, "$1-$2-$3");
            } else if (input.length > 4) {
              input = input.replace(/^(\d{4})(\d{0,3})$/, "$1-$2");
            }

            setMobile(input);
          }}
          maxLength="13" // Ensures user cannot type beyond 11 digits (including dashes)
          required
        />

      <label>Landline Number</label>
      <input type="number" placeholder="Enter landline number" value={landline} onChange={(ev) => setLandline(ev.target.value)} />

      <label>Facebook</label>
      <input type="url" placeholder="Enter Facebook link" value={facebook} onChange={(ev) => setFacebook(ev.target.value)} />

      <label>Date of Birth</label>
      <input type="date" value={birthdate} onChange={(ev) => setBirthdate(ev.target.value)} required />

      <label>Place of Birth</label>
      <input type="text" placeholder="Enter place of birth" value={birthplace} onChange={(ev) => setBirthplace(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Nationality</label>
      <input type="text" placeholder="Enter nationality" value={nationality} onChange={(ev) => setNationality(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Religion</label>
      <input type="text" placeholder="Enter religion" value={religion} onChange={(ev) => setReligion(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Sex</label>
      <select value={sex} onChange={(ev) => setSex(ev.target.value)} required>
        <option value="">Select Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <label>Fathers Name</label>
      <input type="text" placeholder="Enter father's name" value={father} onChange={(ev) => setFather(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Mothers Name</label>
      <input type="text" placeholder="Enter mother's name" value={mother} onChange={(ev) => setMother(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Guardians Name</label>
      <input type="text" placeholder="Enter guardian's name" value={guardian} onChange={(ev) => setGuardian(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Guardians Occupation</label>
      <input type="text" placeholder="Enter guardian's occupation" value={guardianOccupation} onChange={(ev) => setGuardianOccupation(ev.target.value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} required />

      <label>Registration Date</label>
      <input type="date" value={registrationDate} onChange={(ev) => setRegistrationDate(ev.target.value)}/>
                        
      <label>LRN</label>
      <input type="number" placeholder="Enter LRN" value={lrn} onChange={(ev) => {
        const value = ev.target.value.replace(/\D/g, "").slice(0, 12); // Allow only 12 digits
        setLrn(value);
      }} required />
      <label>Education Level</label>
      <select value={education} onChange={(ev) => setEducation(ev.target.value)} required>
        <option value="">Select Education Level</option>
        <option value="elementary">Elementary</option>
        <option value="junior high">Junior High</option>
        <option value="senior high">Senior High</option>
        <option value="college">College</option>
      </select>

      {/* Show Strand input for Senior High */}
      {education === "senior high" && (
        <>
          <label>Strand</label>
          <input
            type="text"
            placeholder="Enter Strand"
            value={strand}
            onChange={(ev) => {
              const value = ev.target.value.toUpperCase().slice(0, 10);
              setStrand(value);
            }}
            required
          />
        </>
      )}

      {/* Show Course input for College */}
      {education === "college" && (
        <>
          <label>Course</label>
          <input
            type="text"
            placeholder="Enter Course"
            value={course}
            onChange={(ev) => {
              const value = ev.target.value.toUpperCase().slice(0, 10);
              setCourse(value);
            }}
            required
          />
        </>
      )}


      <label>Year Level</label>
      <input
        type="text"
        placeholder="Enter Year Level (1-12)"
        value={yearLevel}
        onChange={(ev) => {
          let value = ev.target.value.replace(/\D/g, ""); // Allow only numbers

          // Restrict input to values between 1 and 12
          if (value !== "" && (parseInt(value) < 1 || parseInt(value) > 12)) {
            return;
          }

          setYearLevel(value); // Update state
        }}
        required
      />
      <label>School Year</label>
      <input type="text" placeholder="Enter School Year (e.g., 2023-2024)" value={schoolYear} onChange={(ev) => setSchoolYear(ev.target.value)} required />

      <label>Email</label>
      <input type="email" placeholder="Enter email" value={email} onChange={(ev) => {
    const inputValue = ev.target.value.replace(/@gmail\.com$/, ""); // Remove existing @gmail.com if retyped
    setEmail(inputValue + "@gmail.com");
  }} required />

      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}

