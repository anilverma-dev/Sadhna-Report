import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./SignUp.module.css";

const SignUp = () => {
  // State mein 'gender' add kiya gaya hai
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    facilitator: "",
  });

  const [isLoading, setIsLoading] = useState(false); // Backend loading state
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // NAYA: Backend ko data bhej rahe hain
      const response = await fetch(
        "https://sadhna-backend-api.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Backend me account ban gaya!
        let loggedInUsers =
          JSON.parse(localStorage.getItem("logged_in_users")) || [];

        if (!loggedInUsers.includes(formData.email)) {
          loggedInUsers.push(formData.email);
        }

        localStorage.setItem("logged_in_users", JSON.stringify(loggedInUsers));
        localStorage.setItem("active_user_email", formData.email);

        // TRICK: MainReport ko crash se bachane ke liye abhi ke liye local me bhi daal rahe hain
        let localUsers = JSON.parse(localStorage.getItem("sadhna_users")) || [];
        localUsers.push(data.user);
        localStorage.setItem("sadhna_users", JSON.stringify(localUsers));

        alert("Signup Successful! 🎉");
        navigate("/progress");
      } else {
        alert(data.message); // Agar email already exist karti hai toh error aayega
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert(
        "Server se connect nahi ho paya. Backend chalu hai ya nahi check karein.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Create Account</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Full Name"
            required
            className={styles.inputBox}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email id"
            required
            className={styles.inputBox}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            className={styles.inputBox}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Phone No"
            required
            className={styles.inputBox}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          {/* Gender Selection Dropdown */}
          <select
            className={styles.inputBox}
            required
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            defaultValue=""
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            className={`${styles.inputBox} ${styles.inputLast}`}
            required
            onChange={(e) =>
              setFormData({ ...formData, facilitator: e.target.value })
            }
            defaultValue=""
          >
            <option value="" disabled>
              Select Facilitator
            </option>
            <option value="Avinashi Govind Prabhuji">
              Avinashi Govind Prabhuji
            </option>
            <option value="Devash Baldev Prabhuji">
              Devash Baldev Prabhuji
            </option>
            <option value="Dev Krishna Prabhuji">Dev Krishna Prabhuji</option>
            <option value="Praneshwar Shyam Prabhuji">
              Praneshwar Shyam Prabhuji
            </option>
            <option value="Prajwal Prabhuji">Prajwal Prabhuji</option>
            <option value="Thust Madan Mohan Prabhuji">
              Thust Madan Mohan Prabhuji
            </option>
            <option value="Digvijay Gourang Prabhuji">
              Digvijay Gourang Prabhuji
            </option>
            <option value="Veerbhadra Prabhuji">Veerbhadra Prabhuji</option>
            <option value="Vishudh Parth Prabhuji">
              Vishudh Parth Prabhuji
            </option>
            <option value="Mohan Murari Prabhuji">Mohan Murari Prabhuji</option>
            <option value="Hitkar Vaman Prabhuji">Hitkar Vaman Prabhuji</option>
            <option value="Tribhang Kanai Prabhuji">
              Tribhang Kanai Prabhuji
            </option>
            <option value="Koshal Pati Prabhuji">Koshal Pati Prabhuji</option>
            <option value="Amal Gaur Prabhuji">Amal Gaur Prabhuji</option>
            <option value="Vimal Arjun Prabhuji">Vimal Arjun Prabhuji</option>
          </select>

          <button
            type="submit"
            className={styles.signupBtn}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </button>

          <p className={styles.footerText}>
            Already have an account?
            <Link to="/" className={styles.loginLink}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
