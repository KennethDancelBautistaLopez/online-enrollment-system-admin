import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function PaymentForm({ paymentData, studentData }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [lname, setLname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [lrn, setLrn] = useState("");
  const [education, setEducation] = useState("");
  const [strand, setStrand] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (paymentData) {
      setAmount(paymentData.amount);
      setDescription(paymentData.description);
      setPaymentId(paymentData._id);
      setFname(paymentData.fname);
      setMname(paymentData.mname);
      setLname(paymentData.lname);
      setEmail(paymentData.email);
      setMobile(paymentData.mobile);
    }

    if (studentData) {
      setStudentId(studentData._studentId);
      setFname(studentData.fname);
      setMname(studentData.mname);
      setLname(studentData.lname);
      setLrn(studentData.lrn);
      setEducation(studentData.education);
      setStrand(studentData.strand);
      setCourse(studentData.course);
      setYearLevel(studentData.yearLevel);
      setSchoolYear(studentData.schoolYear);
    }
  }, [paymentData, studentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !amount ||
      !description ||
      !fname ||
      !lname ||
      !studentId ||
      !lrn ||
      !education ||
      !yearLevel ||
      !schoolYear
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (amount > 9999999.99) {
      toast.error("Maximum allowed amount is ₱9,999,999.99");
      return;
    }

    await handlePayment(amount, description, fname, mname, lname, studentId, lrn, education, strand, course, yearLevel, schoolYear);
  };

  const handlePayment = async (
    amount, description, fname, mname, lname, studentId, lrn, education, strand, course, yearLevel, schoolYear
  ) => {
    try {
      const res = await fetch(`/api/payments${paymentId ? `/${paymentId}` : ""}`, {
        method: paymentId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // If you're using auth
        },
        body: JSON.stringify({
          amount,
          description,
          fname,
          mname,
          lname,
          _studentId: studentId,
          lrn,
          education,
          strand,
          course,
          yearLevel,
          schoolYear,
        }),
      });

      const data = await res.json();

      if (data?.checkoutUrl) {
        toast.success("Payment successful! Redirecting...");
        window.open(data.checkoutUrl, "_blank");

        setTimeout(() => {
          router.push({
            pathname: "/payments",
            query: {
              amount,
              description,
              studentId,
              fname,
              mname,
              lname,
              lrn,
              education,
              strand,
              course,
              yearLevel,
              schoolYear,
            },
          });
        }, 5000);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{paymentId ? "Edit Payment" : "Tuition Payment"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Amount (PHP)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter amount"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter description"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">First Name</label>
          <input
            type="text"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter first name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Middle Name</label>
          <input
            type="text"
            value={mname}
            onChange={(e) => setMname(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter middle name"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Last Name</label>
          <input
            type="text"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter last name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter student ID"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">LRN</label>
          <input
            type="text"
            value={lrn}
            onChange={(e) => setLrn(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter LRN"
            required
          />
        </div>
        {/* if the student is college show the course if the student is senior high show the strand */}
        <div>
          <label className="block text-gray-700 font-medium">Education Level</label>
          <select
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select education level</option>
            <option value="college">College</option>
            <option value="seniorHigh">Senior High</option>
          </select>
        </div>
        {education === "college" && (
          <div>
            <label className="block text-gray-700 font-medium">Course</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter course"
              required
            />
          </div>
        )}
        {education === "seniorHigh" && (
          <div>
            <label className="block text-gray-700 font-medium">Strand</label>
            <input
              type="text"
              value={strand}
              onChange={(e) => setStrand(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter strand"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700 font-medium">Year Level</label>
          <input
            type="text"
            value={yearLevel}
            onChange={(e) => setYearLevel(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter year level"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">School Year</label>
          <input
            type="text"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter school year"
            required
          />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg">
          {paymentId ? "Update Payment" : "Submit Payment"}
        </button>
      </form>
    </div>
  );
}
