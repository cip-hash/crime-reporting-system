import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🚫 Unauthorized Access</h1>
      <p style={styles.text}>You do not have permission to view this page.</p>
      <Link to="/" style={styles.link}>Go Back to Home</Link>
    </div>
  );
};

// Inline styles for a simple, clean UI
const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  heading: {
    color: "red",
    fontSize: "28px",
  },
  text: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  link: {
    textDecoration: "none",
    color: "blue",
    fontSize: "20px",
    fontWeight: "bold",
  },
};

export default Unauthorized;
