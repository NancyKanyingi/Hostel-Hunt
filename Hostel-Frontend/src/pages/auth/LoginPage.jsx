// Import Formik components for form handling
import { Formik, Form, Field, ErrorMessage } from "formik";
// Import Yup for form validation schemas
import * as Yup from "yup";
// Import the authentication hook to access login functionality
import { useAuth } from "../../context/AuthContext";
// Import navigation hook from React Router
import { useNavigate } from "react-router-dom";

export default function Login() {
  // Get the login function from AuthContext
  const { login } = useAuth();

  // Hook to navigate programmatically after login
  const navigate = useNavigate();

  return (
    // Center the login card both vertically and horizontally
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Login Card */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {/* Formik handles form state, validation, and submission */}
        <Formik
          initialValues={{ email: "", password: "" }} // default form values
          validationSchema={Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            password: Yup.string().min(6, "Too short").required("Required"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            // Call login from context (simulated or real)
            await login(values);
            // Redirect user to home after login
            navigate("/");
            setSubmitting(false);
          }}
        >
          {/* Formik's Form component replaces normal <form> */}
          <Form>
            {/* Email field */}
            <label>Email</label>
            <Field
              name="email"
              type="email"
              className="w-full border p-2 mb-2"
              placeholder="Enter your email"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-sm"
            />

            {/* Password field */}
            <label>Password</label>
            <Field
              name="password"
              type="password"
              className="w-full border p-2 mb-2"
              placeholder="Enter your password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-sm"
            />

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
